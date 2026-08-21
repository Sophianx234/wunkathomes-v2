'use client';

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPusherClient } from '@/lib/pusher-client';
import { syncLocksFromCloud, renameSmartLock } from '@/actions/admin/smartlock.action';
import { SmartLockManageDialog } from './smartlock-manage-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Battery, BatteryWarning, Wifi, WifiOff, Lock, Unlock, DoorOpen, DoorClosed, Settings2, Edit2, Link as LinkIcon } from 'lucide-react';

export default function SmartLockManager({ 
  allLocks,
  initialSearch = '',
  initialStatus = 'all'
}: { 
  allLocks: any[],
  initialSearch?: string,
  initialStatus?: string
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // State for live monitoring table
  const [liveLocks, setLiveLocks] = useState([...allLocks].sort((a, b) => 
    new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
  ));

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe('smartlocks');
    channel.bind('status_update', (data: any) => {
      setLiveLocks(prev => {
        const updated = prev.map(lock => 
          lock.tuyaDeviceId === data.tuyaDeviceId 
            ? { ...lock, ...data.updates, updatedAt: new Date().toISOString() } 
            : lock
        );
        return updated.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      });
    });

    return () => {
      pusher.unsubscribe('smartlocks');
    };
  }, []);

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  // State for renaming
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  // State for managing
  const [manageLockId, setManageLockId] = useState<string | null>(null);

  // State for search input
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

  // State for live tab filtering
  const [liveSearchTerm, setLiveSearchTerm] = useState('');
  const [liveStatusFilter, setLiveStatusFilter] = useState('all');

  // Helper to construct query string
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all') {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(key, value)}`);
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      handleFilterChange('q', term);
    }, 600);
  };

  const handleSync = async () => {
    setSyncLoading(true);
    setSyncMessage('');
    const res = await syncLocksFromCloud();
    if (res.success) {
      setSyncMessage(res.message || 'Sync complete.');
    } else {
      setSyncMessage(`Error: ${res.error}`);
    }
    setSyncLoading(false);
  };

  const handleRename = async (lockId: string) => {
    if (!editName.trim()) return;
    setRenameLoading(true);
    const res = await renameSmartLock(lockId, editName);
    if (res.success) {
      setEditingId(null);
      setEditName('');
    } else {
      alert(`Error renaming: ${res.error}`);
    }
    setRenameLoading(false);
  };

  const offlineLocks = allLocks.filter(l => l.status === 'offline');
  const lowBatteryLocks = allLocks.filter(l => l.batteryLevel === 'low');
  
  const filteredLiveLocks = liveLocks.filter(lock => {
    const matchesSearch = lock.name.toLowerCase().includes(liveSearchTerm.toLowerCase()) || 
                          lock.tuyaDeviceId.toLowerCase().includes(liveSearchTerm.toLowerCase());
    const matchesStatus = liveStatusFilter === 'all' || lock.status === liveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Tabs defaultValue="directory" className="space-y-6">
      <TabsList className="bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg inline-flex">
        <TabsTrigger value="directory" className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6 data-[state=active]:shadow-sm">
          Fleet Directory
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6 data-[state=active]:shadow-sm">
          Live Monitoring
        </TabsTrigger>
      </TabsList>

      <TabsContent value="directory" className="space-y-6 outline-none">
        {/* Top Action Bar (Sync + Search/Filter) */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={handleSync}
              disabled={syncLoading}
              className="bg-black text-white px-5 py-2.5 rounded text-sm hover:bg-zinc-800 disabled:opacity-50 font-medium shrink-0"
            >
              {syncLoading ? 'Syncing...' : 'Sync Locks'}
            </button>
            {syncMessage && <p className="text-sm text-zinc-600 hidden md:block">{syncMessage}</p>}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 md:w-64 h-10 px-3 text-sm border border-zinc-300 rounded focus:ring-black outline-none"
            />
            <select 
              value={initialStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-10 px-3 text-sm border border-zinc-300 rounded focus:ring-black outline-none bg-white shrink-0"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned (Online)</option>
              <option value="unassigned">Unassigned</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
        
        {syncMessage && <p className="text-sm text-zinc-600 block md:hidden">{syncMessage}</p>}

        {/* Fleet Table */}
        <div className={`bg-white rounded-lg border border-zinc-200 overflow-hidden transition-opacity shadow-sm ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Device Name</th>
                <th className="px-6 py-3 font-medium">Tuya ID</th>
                <th className="px-6 py-3 font-medium">Assigned Property</th>
                <th className="px-6 py-3 font-medium">Power</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {allLocks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    No locks found matching your criteria.
                  </td>
                </tr>
              )}
              {allLocks.map(lock => (
                <tr key={lock._id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    {editingId === lock._id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-zinc-300 rounded px-2 py-1 text-sm focus:ring-black outline-none w-32 md:w-48"
                          autoFocus
                        />
                        <button 
                          onClick={() => handleRename(lock._id)}
                          disabled={renameLoading}
                          className="text-xs bg-zinc-900 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-zinc-900">{lock.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs max-w-[150px] truncate" title={lock.tuyaDeviceId}>
                    {lock.tuyaDeviceId}
                  </td>
                  
                  {/* Assigned Property Column */}
                  <td className="px-6 py-4">
                    {lock.listingId ? (
                      <span className="text-zinc-900 font-medium line-clamp-1" title={lock.listingId.title}>
                        {lock.listingId.title}
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic text-xs">Unassigned</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {lock.batteryLevel ? (
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        {lock.batteryLevel === 'low' ? (
                          <BatteryWarning className="h-3.5 w-3.5 text-zinc-900" />
                        ) : (
                          <Battery className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs font-medium capitalize">{lock.batteryLevel}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">Unknown</span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`capitalize font-medium ${
                      lock.status === 'online' ? 'border-zinc-300 text-zinc-700 bg-zinc-50' :
                      lock.status === 'unassigned' ? 'border-zinc-200 text-zinc-500 bg-zinc-50' :
                      'border-zinc-300 text-zinc-900 bg-zinc-100'
                    }`}>
                      {lock.status}
                    </Badge>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 font-sans">
                        <DropdownMenuItem onClick={() => setManageLockId(lock._id)} className="cursor-pointer flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-zinc-500" />
                          <span>Manage Access</span>
                        </DropdownMenuItem>
                        {editingId !== lock._id && (
                          <DropdownMenuItem 
                            onClick={() => {
                              setEditingId(lock._id);
                              setEditName(lock.name);
                            }}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4 text-zinc-500" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                        )}
                        {lock.listingId && lock.listingId.slug && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/properties/${lock.listingId.slug}/edit`} className="cursor-pointer flex items-center gap-2">
                              <LinkIcon className="h-4 w-4 text-zinc-500" />
                              <span>View Property</span>
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="monitoring" className="space-y-6 outline-none">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Offline Alerts */}
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-zinc-500" />
                Offline Devices ({offlineLocks.length})
              </h3>
            </div>
            <div className="divide-y divide-zinc-200">
              {offlineLocks.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">All assigned devices are online.</div>
              ) : (
                offlineLocks.map(lock => (
                  <div key={lock._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{lock.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{lock.listingId?.title || 'Unassigned'}</p>
                    </div>
                    <button 
                      onClick={() => setManageLockId(lock._id)}
                      className="text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 bg-white px-3 py-1.5 rounded transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Battery Alerts */}
          <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <BatteryWarning className="h-4 w-4 text-zinc-500" />
                Low Battery ({lowBatteryLocks.length})
              </h3>
            </div>
            <div className="divide-y divide-zinc-200">
              {lowBatteryLocks.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500">No low battery warnings.</div>
              ) : (
                lowBatteryLocks.map(lock => (
                  <div key={lock._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900 text-sm">{lock.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{lock.listingId?.title || 'Unassigned'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-zinc-600 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">Low</span>
                      <button 
                        onClick={() => setManageLockId(lock._id)}
                        className="text-xs font-semibold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 bg-white px-3 py-1.5 rounded transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm mt-8">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-zinc-900"></span>
                </span>
                Real-Time Activity Log
              </h3>
              <span className="text-xs text-zinc-500 bg-white border border-zinc-200 px-2 py-1 rounded shadow-sm">Live (Pusher)</span>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                type="text"
                placeholder="Search live stream..."
                value={liveSearchTerm}
                onChange={(e) => setLiveSearchTerm(e.target.value)}
                className="flex-1 md:w-64 h-9 px-3 text-sm border border-zinc-300 rounded focus:ring-black outline-none"
              />
              <select 
                value={liveStatusFilter}
                onChange={(e) => setLiveStatusFilter(e.target.value)}
                className="h-9 px-3 text-sm border border-zinc-300 rounded focus:ring-black outline-none bg-white shrink-0"
              >
                <option value="all">All Statuses</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/50 border-b border-zinc-200 text-zinc-600">
              <tr>
                <th className="px-6 py-3 font-medium">Device Name</th>
                <th className="px-6 py-3 font-medium">Power</th>
                <th className="px-6 py-3 font-medium">Connection</th>
                <th className="px-6 py-3 font-medium">Lock State</th>
                <th className="px-6 py-3 font-medium">Door State</th>
                <th className="px-6 py-3 font-medium">Last Update</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredLiveLocks.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    No active locks found.
                  </td>
                </tr>
              )}
              {filteredLiveLocks.map(lock => (
                <tr key={lock._id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-zinc-900">{lock.name}</span>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{lock.tuyaDeviceId}</p>
                  </td>
                  <td className="px-6 py-4">
                    {lock.batteryLevel ? (
                      <div className="flex items-center gap-1.5 text-zinc-600">
                        {lock.batteryLevel === 'low' ? (
                          <BatteryWarning className="h-3.5 w-3.5 text-zinc-900" />
                        ) : (
                          <Battery className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs font-medium capitalize">{lock.batteryLevel}</span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-xs">Unknown</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`capitalize font-medium ${
                      lock.status === 'online' ? 'border-zinc-300 text-zinc-700 bg-zinc-50' :
                      lock.status === 'unassigned' ? 'border-zinc-200 text-zinc-500 bg-zinc-50' :
                      'border-zinc-300 text-zinc-900 bg-zinc-100'
                    }`}>
                      {lock.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      {lock.lockState === 'unlocked' ? <Unlock className="h-3.5 w-3.5 text-zinc-500" /> : <Lock className="h-3.5 w-3.5 text-zinc-900" />}
                      <span className="text-xs font-medium capitalize">{lock.lockState || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-zinc-700">
                      {lock.doorState === 'open' ? <DoorOpen className="h-3.5 w-3.5 text-zinc-500" /> : <DoorClosed className="h-3.5 w-3.5 text-zinc-900" />}
                      <span className="text-xs font-medium capitalize">{lock.doorState || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {lock.updatedAt ? new Date(lock.updatedAt).toLocaleString() : 'Just now'}
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-zinc-100 text-zinc-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 font-sans">
                        <DropdownMenuItem onClick={() => setManageLockId(lock._id)} className="cursor-pointer flex items-center gap-2">
                          <Settings2 className="h-4 w-4 text-zinc-500" />
                          <span>Manage Access</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <SmartLockManageDialog 
        isOpen={!!manageLockId}
        onClose={() => setManageLockId(null)}
        lock={manageLockId ? allLocks.find(l => l._id === manageLockId) : null}
      />
    </Tabs>
  );
}
