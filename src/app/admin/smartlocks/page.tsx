import { connectToDatabase } from '@/config/DbConnect';
import SmartLock from '@/models/smartlock';
import SmartLockManager from '@/components/admin/smartlock-manager';
import Listing from '@/models/listing'; // Ensure Listing model is loaded for populate

export const dynamic = 'force-dynamic';

export default async function SmartLocksAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  await connectToDatabase();
  const resolvedParams = await searchParams;

  const query: any = {};
  
  if (resolvedParams.status && resolvedParams.status !== 'all') {
    query.status = resolvedParams.status === 'assigned' ? 'online' : resolvedParams.status;
  }
  
  if (resolvedParams.q) {
    query.$or = [
      { name: { $regex: resolvedParams.q, $options: 'i' } },
      { tuyaDeviceId: { $regex: resolvedParams.q, $options: 'i' } }
    ];
  }

  // Fetch locks and populate the listing to get the slug and title
  const allLocks = await SmartLock.find(query)
    .populate({ path: 'listingId', select: 'title slug' })
    .lean();
  
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-zinc-50/50">
      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Smart Locks Management</h1>
          <p className="text-zinc-500 mt-1">Sync hardware from the Tuya Cloud, manage device names, and view assignments.</p>
        </div>

        <SmartLockManager 
          allLocks={JSON.parse(JSON.stringify(allLocks))} 
          initialSearch={resolvedParams.q || ''}
          initialStatus={resolvedParams.status || 'all'}
        />
      </div>
    </div>
  );
}
