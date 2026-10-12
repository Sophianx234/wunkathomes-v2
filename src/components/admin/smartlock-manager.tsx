'use client';

import { useState, useTransition, useCallback, useRef, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPusherClient } from '@/lib/pusher-client';
import { syncLocksFromCloud, renameSmartLock } from '@/actions/admin/smartlock.action';
import { SmartLockManageDialog } from './smartlock-manage-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Battery, BatteryWarning, Wifi, WifiOff, Lock, Unlock, DoorOpen, DoorClosed, Settings2, Edit2, Link as LinkIcon, Loader2, Radio } from 'lucide-react';

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

  // Store only the *deltas* (updates) from Pusher in state
  const [liveUpdates, setLiveUpdates] = useState<Record<string, any>>({});
  const [liveActivities, setLiveActivities] = useState<any[]>([]);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe('smartlocks');
    channel.bind('status_update', (data: any) => {
      setLiveUpdates(prev => ({
        ...prev,
        [data.tuyaDeviceId]: { 
          ...prev[data.tuyaDeviceId], 
          ...data.updates, 
          updatedAt: new Date().toISOString() 
        }
      }));
    });

    channel.bind('activity_log', (data: any) => {
      setLiveActivities(prev => [data, ...prev].slice(0, 50)); // keep last 50 events
    });

    return () => {
      pusher.unsubscribe('smartlocks');
    };
  }, []);

  // Merge the server truth (allLocks) with the live updates
  const liveLocks = useMemo(() => {
    return allLocks.map(lock => {
      const updates = liveUpdates[lock.tuyaDeviceId];
      if (updates) return { ...lock, ...updates };
      return lock;
    }).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
  }, [allLocks, liveUpdates]);

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

  // API Health Check
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline' | null>(null);
  const [checkingStep, setCheckingStep] = useState(0);
  
  const checkApiHealth = async () => {
    setApiHealth('checking');
    setCheckingStep(0);
    
    // Cycle loading text
    const loadingTexts = ['Establishing connection...', 'Authenticating...', 'Awaiting response...'];
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % loadingTexts.length;
      setCheckingStep(step);
    }, 1500);

    try {
      // Small artificial delay if the API is too fast, so the user actually sees the loading state
      const [res] = await Promise.all([
        fetch('/api/tuya/health'),
        new Promise(r => setTimeout(r, 2000))
      ]);

      clearInterval(interval);

      if (res.ok) {
        setApiHealth('online');
      } else {
        setApiHealth('offline');
        setTimeout(() => setApiHealth(null), 3000);
      }
    } catch (e) {
      clearInterval(interval);
      setApiHealth('offline');
      setTimeout(() => setApiHealth(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="directory" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <TabsList className="bg-zinc-100 p-1 rounded-xl inline-flex h-10 border border-zinc-200/60 shadow-2xs">
            <TabsTrigger 
              value="directory" 
              className="text-xs font-medium data-[state=active]:bg-white rounded-lg px-4 data-[state=active]:shadow-xs data-[state=active]:text-zinc-900 text-zinc-600 transition-all active:scale-95"
            >
              Fleet Directory
            </TabsTrigger>
            <TabsTrigger 
              value="monitoring" 
              className="text-xs font-medium data-[state=active]:bg-white rounded-lg px-4 data-[state=active]:shadow-xs data-[state=active]:text-zinc-900 text-zinc-600 transition-all active:scale-95"
            >
              Live Monitoring
            </TabsTrigger>
          </TabsList>

          <button 
            onClick={apiHealth === 'checking' ? undefined : checkApiHealth} 
            disabled={apiHealth === 'checking'}
            className="h-10 text-xs bg-white border border-zinc-200 hover:border-zinc-300 px-3.5 rounded-xl hover:bg-zinc-50 flex items-center gap-2.5 transition-all w-52 justify-center shadow-xs active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {apiHealth === 'checking' ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500 shrink-0" />
                <span className="font-medium text-zinc-600 truncate text-xs">
                  {['Connecting...', 'Authenticating...', 'Verifying...'][checkingStep]}
                </span>
              </>
            ) : apiHealth === 'online' ? (
              <>
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-medium text-emerald-700 truncate text-xs">Connection Active</span>
              </>
            ) : apiHealth === 'offline' ? (
              <>
                <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)] shrink-0"></span>
                <span className="font-medium text-rose-700 truncate text-xs">Connection Failed</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-zinc-300 shrink-0"></span>
                <span className="font-medium text-zinc-700 truncate text-xs">Test Tuya Connection</span>
              </>
            )}
          </button>
        </div>

        <TabsContent value="directory" className="space-y-6 outline-none">
          {/* Top Action Bar (Sync + Search/Filter) */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={handleSync}
                disabled={syncLoading}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 h-9 rounded-lg text-xs font-medium disabled:opacity-50 shrink-0 inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xs"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Syncing Fleet...</span>
                  </>
                ) : (
                  'Sync Locks'
                )}
              </button>
              {syncMessage && (
                <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/60 px-2.5 py-1 rounded-md hidden md:block">
                  {syncMessage}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input 
                  type="text"
                  placeholder="Search fleet by name or ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full h-9 pl-3.5 pr-8 text-xs border border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-white focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all placeholder:text-zinc-400"
                />
                {searchTerm && (
                  <button 
                    onClick={() => handleSearch('')} 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select 
                value={initialStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="h-9 px-3 text-xs border border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-white focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all text-zinc-700 shrink-0"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned (Online)</option>
                <option value="unassigned">Unassigned</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
          
          {syncMessage && <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200/60 p-2 rounded-lg block md:hidden">{syncMessage}</p>}

          {/* Fleet Table */}
          <div className={`bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 text-xs font-medium">
                <tr>
                  <th className="px-5 py-3 font-medium">Device Name</th>
                  <th className="px-5 py-3 font-medium">Tuya ID</th>
                  <th className="px-5 py-3 font-medium">Assigned Property</th>
                  <th className="px-5 py-3 font-medium">Power</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {allLocks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No locks found matching your criteria.
                    </td>
                  </tr>
                )}
                {allLocks.map(lock => (
                  <tr key={lock._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      {editingId === lock._id ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border border-zinc-200 rounded-md px-2.5 py-1 text-xs focus:ring-1 focus:ring-zinc-400 outline-none w-36 md:w-48 bg-white"
                            autoFocus
                          />
                          <button 
                            onClick={() => handleRename(lock._id)}
                            disabled={renameLoading}
                            className="text-xs bg-zinc-900 hover:bg-zinc-800 text-white px-2.5 py-1 rounded-md font-medium active:scale-95 transition-all"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="text-xs text-zinc-500 hover:text-zinc-800 px-1 py-1"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-600">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-medium text-zinc-900 text-sm block truncate">{lock.name}</span>
                            <span className="text-[11px] text-zinc-400 font-mono block sm:hidden truncate">{lock.tuyaDeviceId}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs max-w-[150px] truncate" title={lock.tuyaDeviceId}>
                      <span className="bg-zinc-100/70 border border-zinc-200/60 px-2 py-0.5 rounded text-[11px] text-zinc-600 font-mono">
                        {lock.tuyaDeviceId}
                      </span>
                    </td>
                    
                    {/* Assigned Property Column */}
                    <td className="px-5 py-3.5">
                      {lock.listingId ? (
                        <span className="text-zinc-900 text-xs font-medium line-clamp-1" title={lock.listingId.title}>
                          {lock.listingId.title}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {lock.batteryPercentage != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                            <div 
                              className={`h-full ${lock.batteryPercentage <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${lock.batteryPercentage}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono tabular-nums text-zinc-600">{lock.batteryPercentage}%</span>
                        </div>
                      ) : lock.batteryLevel ? (
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          {lock.batteryLevel === 'low' ? (
                            <BatteryWarning className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <Battery className="h-3.5 w-3.5 text-zinc-500" />
                          )}
                          <span className="text-xs font-medium capitalize">{lock.batteryLevel}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">Unknown</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        lock.status === 'online' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : lock.status === 'unassigned' 
                          ? 'bg-zinc-100 text-zinc-600 border border-zinc-200/60' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          lock.status === 'online' ? 'bg-emerald-500' : lock.status === 'unassigned' ? 'bg-zinc-400' : 'bg-rose-500'
                        }`} />
                        <span className="capitalize">{lock.status}</span>
                      </span>
                    </td>
                    
                    {/* Actions Column */}
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 active:scale-95 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 font-sans rounded-xl p-1 shadow-lg border-zinc-200">
                          <DropdownMenuItem onClick={() => setManageLockId(lock._id)} className="cursor-pointer flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5">
                            <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Manage Access</span>
                          </DropdownMenuItem>
                          {editingId !== lock._id && (
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingId(lock._id);
                                setEditName(lock.name);
                              }}
                              className="cursor-pointer flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-zinc-500" />
                              <span>Rename Device</span>
                            </DropdownMenuItem>
                          )}
                          {lock.listingId && lock.listingId.slug && (
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/properties/${lock.listingId.slug}/edit`} className="cursor-pointer flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5">
                                <LinkIcon className="h-3.5 w-3.5 text-zinc-500" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Offline Alerts */}
            <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                    <WifiOff className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 text-xs">Offline Devices</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60 text-zinc-700 font-mono tabular-nums">
                  {offlineLocks.length}
                </span>
              </div>
              <div className="divide-y divide-zinc-100">
                {offlineLocks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">All assigned devices are currently online.</div>
                ) : (
                  offlineLocks.map(lock => (
                    <div key={lock._id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div>
                        <p className="font-medium text-zinc-900 text-xs">{lock.name}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{lock.listingId?.title || 'Unassigned'}</p>
                      </div>
                      <button 
                        onClick={() => setManageLockId(lock._id)}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 px-3 py-1 rounded-lg active:scale-[0.98] transition-all shadow-2xs"
                      >
                        Manage
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Low Battery Alerts */}
            <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                    <BatteryWarning className="h-3.5 w-3.5" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 text-xs">Low Battery Warnings</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/60 text-zinc-700 font-mono tabular-nums">
                  {lowBatteryLocks.length}
                </span>
              </div>
              <div className="divide-y divide-zinc-100">
                {lowBatteryLocks.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">All battery levels are healthy.</div>
                ) : (
                  lowBatteryLocks.map(lock => (
                    <div key={lock._id} className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div>
                        <p className="font-medium text-zinc-900 text-xs">{lock.name}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{lock.listingId?.title || 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">Low</span>
                        <button 
                          onClick={() => setManageLockId(lock._id)}
                          className="text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 px-3 py-1 rounded-lg active:scale-[0.98] transition-all shadow-2xs"
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

          {/* Live Activity Stream */}
          <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                  <Radio className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-semibold text-zinc-900 text-xs">Security & Access Activity Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] text-zinc-500 font-medium">Live Stream</span>
              </div>
            </div>
            <div className="p-0">
              {liveActivities.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-500">
                  Listening for hardware events from Tuya Cloud...
                </div>
              ) : (
                <ul className="divide-y divide-zinc-100 max-h-[380px] overflow-y-auto">
                  {liveActivities.map((act, idx) => (
                    <li key={idx} className="px-5 py-3.5 hover:bg-zinc-50/60 transition-colors text-xs flex items-start gap-3">
                      <div className="shrink-0 mt-1">
                        {act.action === 'ALARM_TRIGGERED' ? (
                          <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                        ) : act.action === 'ALARM_CLEARED' ? (
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-zinc-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-zinc-900 font-medium truncate">
                            {act.lockName} <span className="text-zinc-400 font-mono text-[11px]">({act.tuyaDeviceId})</span>
                          </p>
                          <span className="text-[11px] text-zinc-400 font-mono tabular-nums shrink-0">
                            {new Date(act.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-zinc-600 mt-0.5">
                          <span className="font-semibold text-zinc-800">{act.action}</span> - {act.performedBy} 
                          {act.metadata?.targetName && (
                            <code className="ml-2 text-[10px] bg-zinc-100 border border-zinc-200/60 px-1.5 py-0.5 rounded text-zinc-600 font-mono">
                              {act.metadata.targetName}
                            </code>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Live Device Status Table */}
          <div className="bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <h3 className="font-semibold text-zinc-900 text-xs">Live Device Telemetry</h3>
              
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <input 
                  type="text"
                  placeholder="Search live stream..."
                  value={liveSearchTerm}
                  onChange={(e) => setLiveSearchTerm(e.target.value)}
                  className="flex-1 md:w-56 h-8 px-3 text-xs border border-zinc-200 rounded-lg bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all placeholder:text-zinc-400"
                />
                <select 
                  value={liveStatusFilter}
                  onChange={(e) => setLiveStatusFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs border border-zinc-200 rounded-lg bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all text-zinc-700 shrink-0"
                >
                  <option value="all">All Statuses</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="unassigned">Unassigned</option>
                </select>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 text-xs font-medium">
                <tr>
                  <th className="px-5 py-3 font-medium">Device Name</th>
                  <th className="px-5 py-3 font-medium">Power</th>
                  <th className="px-5 py-3 font-medium">Connection</th>
                  <th className="px-5 py-3 font-medium">Lock State</th>
                  <th className="px-5 py-3 font-medium">Door State</th>
                  <th className="px-5 py-3 font-medium">Last Update</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {filteredLiveLocks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      No active locks found.
                    </td>
                  </tr>
                )}
                {filteredLiveLocks.map(lock => (
                  <tr key={lock._id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-900">{lock.name}</span>
                        {lock.activeAlarms && lock.activeAlarms.length > 0 && (
                          <span className="inline-flex animate-pulse items-center gap-1 rounded-md bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                            {lock.activeAlarms.length} ALARM(S)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{lock.tuyaDeviceId}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      {lock.batteryPercentage != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                            <div 
                              className={`h-full ${lock.batteryPercentage <= 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${lock.batteryPercentage}%` }} 
                            />
                          </div>
                          <span className="text-xs font-mono tabular-nums text-zinc-600">{lock.batteryPercentage}%</span>
                        </div>
                      ) : lock.batteryLevel ? (
                        <div className="flex items-center gap-1.5 text-zinc-600">
                          {lock.batteryLevel === 'low' ? (
                            <BatteryWarning className="h-3.5 w-3.5 text-amber-500" />
                          ) : (
                            <Battery className="h-3.5 w-3.5 text-zinc-500" />
                          )}
                          <span className="text-xs font-medium capitalize">{lock.batteryLevel}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">Unknown</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                        lock.status === 'online' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : lock.status === 'unassigned' 
                          ? 'bg-zinc-100 text-zinc-600 border border-zinc-200/60' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          lock.status === 'online' ? 'bg-emerald-500' : lock.status === 'unassigned' ? 'bg-zinc-400' : 'bg-rose-500'
                        }`} />
                        <span className="capitalize">{lock.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {!lock.lockState || lock.lockState === 'unknown' ? (
                        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                          Auto (Clutch)
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-700">
                          {lock.lockState === 'unlocked' ? (
                            <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-zinc-700" />
                          )}
                          <span className="text-xs font-medium capitalize">{lock.lockState}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {!lock.doorState || lock.doorState === 'unknown' ? (
                        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/60">
                          No Sensor
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-700">
                          {lock.doorState === 'open' ? (
                            <DoorOpen className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <DoorClosed className="h-3.5 w-3.5 text-zinc-700" />
                          )}
                          <span className="text-xs font-medium capitalize">{lock.doorState}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 font-mono tabular-nums">
                      {lock.updatedAt ? new Date(lock.updatedAt).toLocaleTimeString() : 'Just now'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 inline-flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 active:scale-95 transition-all">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 font-sans rounded-xl p-1 shadow-lg border-zinc-200">
                          <DropdownMenuItem onClick={() => setManageLockId(lock._id)} className="cursor-pointer flex items-center gap-2 text-xs rounded-lg px-2.5 py-1.5">
                            <Settings2 className="h-3.5 w-3.5 text-zinc-500" />
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
          lock={manageLockId ? liveLocks.find(l => l._id === manageLockId) : null}
        />
      </Tabs>
    </div>
  );
}
