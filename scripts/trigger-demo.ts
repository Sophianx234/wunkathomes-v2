import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function triggerDemo() {
  try {
    // Parse arguments: milestone (50, 75, 90, expired) and optional email
    const milestoneArg = process.argv[2] || 'expired';
    const targetEmail = process.argv[3]; 

    console.log(`\n🛠️  Preparing Demo State for: ${milestoneArg.toUpperCase()}`);

    // Dynamically import to ensure env variables are loaded first
    const { connectToDatabase } = await import('../src/config/DbConnect');
    const mongoose = (await import('mongoose')).default;
    const Lease = (await import('../src/models/lease')).default;
    const User = (await import('../src/models/user')).default;

    await connectToDatabase();

    // 1. Find User/Lease
    let lease;
    if (targetEmail) {
      const user = await User.findOne({ email: targetEmail });
      if (!user) {
        console.error(`❌ User ${targetEmail} not found. Please check the email.`);
        process.exit(1);
      }
      lease = await Lease.findOne({ userId: user._id, status: 'Active' })
        .populate('listingId', 'title')
        .populate('userId', 'email name');
    } else {
      // Auto-select the first active lease if no email is provided
      lease = await Lease.findOne({ status: 'Active' })
        .populate('listingId', 'title')
        .populate('userId', 'email name');
        
      if (lease) {
         console.log(`ℹ️  No email provided. Auto-selected active lease for ${lease.userId.email}`);
      }
    }

    if (!lease) {
      console.error(`❌ No active lease found to target. Ensure there is at least one 'Active' lease in the DB.`);
      process.exit(1);
    }

    // 2. Artificially advance dates to simulate the passing of time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Initialize reminders object if it doesn't exist
    if (!lease.reminders) lease.reminders = {};

    switch (milestoneArg) {
      case '50':
        if (!lease.reminders.milestone1) lease.reminders.milestone1 = {};
        lease.reminders.milestone1.triggerDate = yesterday;
        lease.reminders.milestone1.sent = false;
        // Make sure it doesn't accidentally trigger 'expired' if it was already expired
        if (lease.endDate <= new Date()) lease.endDate = nextWeek;
        break;
      case '75':
        if (!lease.reminders.milestone2) lease.reminders.milestone2 = {};
        lease.reminders.milestone2.triggerDate = yesterday;
        lease.reminders.milestone2.sent = false;
        if (lease.endDate <= new Date()) lease.endDate = nextWeek;
        break;
      case '90':
        if (!lease.reminders.milestone3) lease.reminders.milestone3 = {};
        lease.reminders.milestone3.triggerDate = yesterday;
        lease.reminders.milestone3.sent = false;
        if (lease.endDate <= new Date()) lease.endDate = nextWeek;
        break;
      case 'expired':
      default:
        lease.endDate = yesterday;
        if (!lease.reminders.expired) lease.reminders.expired = {};
        lease.reminders.expired.triggerDate = yesterday;
        lease.reminders.expired.sent = false;
        break;
    }

    await lease.save();
    console.log(`✅ Lease for "${lease.listingId.title}" updated in DB for milestone: ${milestoneArg}.`);

    // 3. Trigger the Cron Route Automatically
    console.log("🚀 Triggering the check-subscriptions cron job...");
    
    const API_URL = "http://localhost:3000/api/cron/check-subscriptions";
    const CRON_SECRET = process.env.CRON_SECRET || "";

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${CRON_SECRET}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        console.log("🎉 Cron job executed successfully!");
        console.log("Response:", data);
        console.log("\n💡 Demo instructions:");
        console.log(" - Check the user's email inbox for the reminder/expiry email.");
        if (milestoneArg === 'expired') {
          console.log(" - The lease status is now 'Expired'.");
          console.log(" - Any Smart Lock PINs for this tenant have been wiped.");
        }
      } else {
        console.error("❌ Cron job failed. Server responded with:", data);
      }
    } catch(e: any) {
        console.log("⚠️ Could not reach the Next.js API.");
        console.log(`   Ensure your Next.js server is running (npm run dev) on port 3000.`);
        console.log(`   Error Details: ${e.message}`);
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error("❌ An error occurred:", error);
    process.exit(1);
  }
}

triggerDemo();
