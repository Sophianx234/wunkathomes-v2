import * as dotenv from 'dotenv';
import path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface ResetStats {
  listingsReset: number;
  leasesCancelled: number;
  leasesPurged: number;
  pinsRevoked: number;
  locksUpdated: number;
  cleaningsCancelled: number;
  maintenanceCancelled: number;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: {
    room?: string;
    property?: string;
    all?: boolean;
    hard?: boolean;
    help?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--room' || arg === '-r') {
      options.room = args[++i];
    } else if (arg === '--property' || arg === '-p') {
      options.property = args[++i];
    } else if (arg === '--all' || arg === '-a') {
      options.all = true;
    } else if (arg === '--hard') {
      options.hard = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (!arg.startsWith('-') && !options.room && !options.property) {
      // Positional argument fallback: treat first bare string as room target
      options.room = arg;
    }
  }

  return options;
}

function printUsage() {
  console.log(`
🏠 Wunkat Homes - Reset Room / Property to Default Utility

Usage:
  npm run reset                               Launch interactive selection mode
  npm run reset:room -- <id|slug|title>       Reset a specific room/listing
  npm run reset:property -- <propertyId>      Reset all rooms in a property
  npm run reset -- --all                      Reset ALL rented/pending rooms in DB
  npm run reset -- --room <target> --hard     Hard purge leases instead of cancelling

Flags:
  -r, --room <val>       Target a listing by ObjectId, slug, or title keyword
  -p, --property <val>   Target a property by ObjectId or area keyword
  -a, --all              Reset every listing currently not Available
  --hard                 Completely delete leases instead of marking Cancelled
  -h, --help             Show this help screen
`);
}

async function run() {
  const options = parseCliArgs();

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  const { connectToDatabase } = await import('../src/config/DbConnect');
  const mongoose = (await import('mongoose')).default;
  const Property = (await import('../src/models/property')).default;
  const Listing = (await import('../src/models/listing')).default;
  const Lease = (await import('../src/models/lease')).default;
  const SmartLock = (await import('../src/models/smartlock')).default;
  const AccessLog = (await import('../src/models/accesslog')).default;
  const CleaningSchedule = (await import('../src/models/cleaning')).default;
  const Maintenance = (await import('../src/models/maintenance')).default;

  let deleteTemporaryPinFn: ((deviceId: string, passwordId: string) => Promise<any>) | null = null;
  try {
    const tuyaModule = await import('../src/lib/tuya');
    deleteTemporaryPinFn = tuyaModule.deleteTemporaryPin;
  } catch (err: any) {
    console.warn(`⚠️  Tuya module could not be initialized (${err.message}). Hardware PIN revocation will be bypassed.`);
  }

  await connectToDatabase();
  console.log('📦 Connected to MongoDB successfully.\n');

  const stats: ResetStats = {
    listingsReset: 0,
    leasesCancelled: 0,
    leasesPurged: 0,
    pinsRevoked: 0,
    locksUpdated: 0,
    cleaningsCancelled: 0,
    maintenanceCancelled: 0,
  };

  const isObjectId = (val: string) => /^[0-9a-fA-F]{24}$/.test(val);

  let targetListings: any[] = [];
  let descriptionLabel = '';

  // --------------------------------------------------------------------------
  // 1. DETERMINE TARGETS (CLI ARGUMENTS vs INTERACTIVE MENU)
  // --------------------------------------------------------------------------
  if (options.all) {
    targetListings = await Listing.find({ status: { $ne: 'Available' } }).populate('propertyId');
    descriptionLabel = `ALL occupied/pending rooms (${targetListings.length} found)`;
  } else if (options.property) {
    const propQuery = isObjectId(options.property)
      ? { _id: options.property }
      : { 'location.area': { $regex: new RegExp(options.property, 'i') } };

    const property = await Property.findOne(propQuery);
    if (!property) {
      console.error(`❌ Property not found with identifier: "${options.property}"`);
      await mongoose.disconnect();
      process.exit(1);
    }

    targetListings = await Listing.find({ propertyId: property._id }).populate('propertyId');
    descriptionLabel = `Property "${property.location?.area || property._id}" (${targetListings.length} room(s))`;
  } else if (options.room) {
    const roomQuery: any = isObjectId(options.room)
      ? { _id: options.room }
      : {
          $or: [
            { slug: options.room },
            { title: { $regex: new RegExp(options.room, 'i') } },
          ],
        };

    const listing = await Listing.findOne(roomQuery).populate('propertyId');
    if (!listing) {
      console.error(`❌ Room/Listing not found with identifier: "${options.room}"`);
      await mongoose.disconnect();
      process.exit(1);
    }
    targetListings = [listing];
    descriptionLabel = `Room "${listing.title}" [${listing.slug || listing._id}]`;
  } else {
    // Interactive CLI mode
    const rl = readline.createInterface({ input, output });

    console.log('🔍 Gathering current database occupancy status...\n');

    const occupiedListings = await Listing.find({ status: { $in: ['Rented', 'Pending', 'Sold'] } })
      .populate('propertyId')
      .sort({ updatedAt: -1 });

    const activeLeases = await Lease.find({
      status: { $in: ['Active', 'Pending_Verification', 'Awaiting_Admin_Approval', 'Awaiting_Payment'] },
    }).populate('listingId');

    console.log(`📊 Current Status:`);
    console.log(`   • Non-Available Listings: ${occupiedListings.length}`);
    console.log(`   • Active / Pending Leases: ${activeLeases.length}\n`);

    console.log('Select an action:');
    console.log('  [1] Reset a specific Room / Listing');
    console.log('  [2] Reset all rooms belonging to a Property');
    console.log('  [3] Reset ALL non-available rooms in database');
    console.log('  [4] Exit');

    const choice = (await rl.question('\nChoice [1-4]: ')).trim();

    if (choice === '1') {
      if (occupiedListings.length === 0) {
        console.log('ℹ️  No occupied rooms found. Querying all listings...');
        const allListings = await Listing.find().limit(20).populate('propertyId');
        allListings.forEach((l, idx) => {
          console.log(`  [${idx + 1}] ${l.title} (Status: ${l.status}) [ID: ${l._id}]`);
        });
        const pick = parseInt(await rl.question('\nEnter number or enter search keyword: '), 10);
        if (!isNaN(pick) && pick > 0 && pick <= allListings.length) {
          targetListings = [allListings[pick - 1]];
        } else {
          rl.close();
          await mongoose.disconnect();
          process.exit(0);
        }
      } else {
        console.log('\nCurrently occupied/pending rooms:');
        occupiedListings.forEach((l, idx) => {
          console.log(`  [${idx + 1}] "${l.title}" - Status: ${l.status} (Property: ${l.propertyId?.location?.area || 'N/A'})`);
        });
        const pick = parseInt(await rl.question(`\nSelect room [1-${occupiedListings.length}]: `), 10);
        if (isNaN(pick) || pick < 1 || pick > occupiedListings.length) {
          console.log('❌ Invalid selection.');
          rl.close();
          await mongoose.disconnect();
          process.exit(1);
        }
        targetListings = [occupiedListings[pick - 1]];
      }
      descriptionLabel = `Room "${targetListings[0].title}"`;
    } else if (choice === '2') {
      const properties = await Property.find();
      if (properties.length === 0) {
        console.log('❌ No properties found in the database.');
        rl.close();
        await mongoose.disconnect();
        process.exit(1);
      }
      console.log('\nAvailable Properties:');
      properties.forEach((p, idx) => {
        console.log(`  [${idx + 1}] ${p.location?.area || 'Unknown Area'}, ${p.location?.region || ''} (${p.propertyType}) [ID: ${p._id}]`);
      });
      const pick = parseInt(await rl.question(`\nSelect property [1-${properties.length}]: `), 10);
      if (isNaN(pick) || pick < 1 || pick > properties.length) {
        console.log('❌ Invalid selection.');
        rl.close();
        await mongoose.disconnect();
        process.exit(1);
      }
      const selectedProp = properties[pick - 1];
      targetListings = await Listing.find({ propertyId: selectedProp._id }).populate('propertyId');
      descriptionLabel = `Property "${selectedProp.location?.area || selectedProp._id}" (${targetListings.length} room(s))`;
    } else if (choice === '3') {
      targetListings = occupiedListings;
      descriptionLabel = `ALL occupied/pending rooms (${targetListings.length} items)`;
    } else {
      console.log('Exiting without changes.');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    if (targetListings.length === 0) {
      console.log('ℹ️  No rooms found matching selection to reset.');
      rl.close();
      await mongoose.disconnect();
      process.exit(0);
    }

    const confirm = (await rl.question(`\n⚠️  Are you sure you want to revert ${descriptionLabel} to default? (y/N): `)).trim().toLowerCase();
    rl.close();

    if (confirm !== 'y' && confirm !== 'yes') {
      console.log('Aborted.');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  if (targetListings.length === 0) {
    console.log('ℹ️  No target rooms found to reset.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const targetListingIds = targetListings.map((l) => l._id);
  const targetPropertyIds = Array.from(
    new Set(targetListings.map((l) => (l.propertyId?._id ? l.propertyId._id.toString() : l.propertyId?.toString())).filter(Boolean))
  );

  console.log(`\n🚀 Beginning Reset Procedure for: ${descriptionLabel}`);
  console.log(`   Target Room Count: ${targetListings.length}`);
  console.log(`   Target Property Count: ${targetPropertyIds.length}\n`);

  // --------------------------------------------------------------------------
  // 2. PROCESS LEASES (SUBSCRIPTIONS)
  // --------------------------------------------------------------------------
  console.log('📄 Step 1: Handling active/pending Leases & Subscriptions...');
  const associatedLeases = await Lease.find({ listingId: { $in: targetListingIds } });

  if (options.hard) {
    const deleteResult = await Lease.deleteMany({ listingId: { $in: targetListingIds } });
    stats.leasesPurged = deleteResult.deletedCount || 0;
    console.log(`   🗑️  Hard purged ${stats.leasesPurged} lease record(s).`);
  } else {
    for (const lease of associatedLeases) {
      const activeOrPending = ['Active', 'Pending_Verification', 'Awaiting_Admin_Approval', 'Awaiting_Payment'].includes(lease.status);
      if (activeOrPending || lease.smartLockPin) {
        lease.status = 'Cancelled';
        lease.smartLockPin = undefined;
        lease.intentToVacate = false;
        lease.vacateReason = 'Force Reset to Default via Admin Script';
        if (lease.reminders) {
          if (lease.reminders.milestone1) lease.reminders.milestone1.sent = false;
          if (lease.reminders.milestone2) lease.reminders.milestone2.sent = false;
          if (lease.reminders.milestone3) lease.reminders.milestone3.sent = false;
          if (lease.reminders.expired) lease.reminders.expired.sent = false;
        }
        await lease.save();
        stats.leasesCancelled++;
      }
    }
    console.log(`   ✅ Cancelled & cleared ${stats.leasesCancelled} active/pending lease(s).`);
  }

  // --------------------------------------------------------------------------
  // 3. HARDWARE & SMART LOCK DE-PROVISIONING (TUYA API)
  // --------------------------------------------------------------------------
  console.log('🔒 Step 2: Checking Smart Locks & Revoking Tenant PINs...');
  const locks = await SmartLock.find({
    $or: [
      { listingId: { $in: targetListingIds } },
      { propertyId: { $in: targetPropertyIds } },
    ],
  });

  for (const lock of locks) {
    let lockModified = false;

    if (lock.activeTempPins && lock.activeTempPins.length > 0) {
      for (const pin of lock.activeTempPins) {
        if (deleteTemporaryPinFn && lock.tuyaDeviceId && pin.pinId) {
          try {
            await deleteTemporaryPinFn(lock.tuyaDeviceId, pin.pinId);
            stats.pinsRevoked++;
          } catch (pinError: any) {
            console.warn(`   ⚠️  Tuya Hardware Warning for Lock ${lock.tuyaDeviceId} (PIN ${pin.pinId}): ${pinError.message}`);
          }
        }
      }
      lock.activeTempPins = [];
      lockModified = true;
    }

    if (lockModified) {
      await lock.save();
      stats.locksUpdated++;

      // Create an audit record for physical security tracking
      try {
        await AccessLog.create({
          lockId: lock._id,
          propertyId: lock.propertyId,
          action: 'SYSTEM_LOCKOUT',
          actorId: null,
          actorType: 'System',
          performedBy: 'Script: reset-default',
          metadata: {
            reason: 'Force Reset to Default',
            autoRevokedPins: true,
            affectedListings: targetListingIds.map((id) => id.toString()),
          },
        });
      } catch (logErr: any) {
        console.warn(`   ⚠️  Could not write AccessLog: ${logErr.message}`);
      }
    }
  }
  console.log(`   ✅ Processed ${locks.length} Smart Lock(s). Revoked ${stats.pinsRevoked} PIN(s) and cleared credentials.`);

  // --------------------------------------------------------------------------
  // 4. CLEANING SCHEDULES & MAINTENANCE CLEANUP
  // --------------------------------------------------------------------------
  console.log('🧹 Step 3: Cancelling associated Cleaning Schedules & open Maintenance...');
  const cleaningResult = await CleaningSchedule.updateMany(
    {
      listingId: { $in: targetListingIds },
      status: { $in: ['active', 'paused'] },
    },
    { $set: { status: 'cancelled' } }
  );
  stats.cleaningsCancelled = cleaningResult.modifiedCount || 0;

  const maintenanceResult = await Maintenance.updateMany(
    {
      listingId: { $in: targetListingIds },
      status: { $in: ['Pending', 'In_Progress'] },
    },
    {
      $set: {
        status: 'Cancelled',
        description: 'Auto-cancelled: Room/Property reversed to default via script.',
      },
    }
  );
  stats.maintenanceCancelled = maintenanceResult.modifiedCount || 0;

  console.log(`   ✅ Cancelled ${stats.cleaningsCancelled} cleaning schedule(s).`);
  console.log(`   ✅ Cancelled ${stats.maintenanceCancelled} open maintenance ticket(s).`);

  // --------------------------------------------------------------------------
  // 5. RESTORE LISTINGS TO DEFAULT ("Available")
  // --------------------------------------------------------------------------
  console.log('🚪 Step 4: Reverting Room / Listing status to "Available"...');
  const listingUpdateResult = await Listing.updateMany(
    { _id: { $in: targetListingIds } },
    { $set: { status: 'Available' } }
  );
  stats.listingsReset = listingUpdateResult.modifiedCount || 0;

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log(`
=============================================================
🎉 SUCCESS: REVERSAL TO DEFAULT COMPLETE
=============================================================
Target:                     ${descriptionLabel}
Rooms set to Available:     ${stats.listingsReset} of ${targetListings.length}
Leases Cancelled (Soft):    ${stats.leasesCancelled}
Leases Purged (Hard):       ${stats.leasesPurged}
Smart Lock PINs Revoked:    ${stats.pinsRevoked}
Locks Cleared in DB:        ${stats.locksUpdated}
Cleaning Schedules Cancelled: ${stats.cleaningsCancelled}
Maintenance Tickets Closed: ${stats.maintenanceCancelled}
Financial Transactions:     PRESERVED (audit-safe)
=============================================================
All targeted units are now available for new bookings!
`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (error) => {
  console.error('❌ Fatal error during reset procedure:', error);
  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
