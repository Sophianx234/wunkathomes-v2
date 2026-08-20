'use client';

import { useState, useTransition, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { syncLocksFromCloud, renameSmartLock } from '@/actions/admin/smartlock.action';

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

  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  
  // State for renaming
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  // State for search input
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debounceTimerRef = useRef<NodeJS.Timeout>(null);

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

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Sync + Search/Filter) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-zinc-200">
        
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
      <div className={`bg-white rounded-lg border border-zinc-200 overflow-hidden transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
            <tr>
              <th className="px-6 py-3 font-medium">Device Name</th>
              <th className="px-6 py-3 font-medium">Tuya ID</th>
              <th className="px-6 py-3 font-medium">Assigned Property</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {allLocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
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
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    lock.status === 'online' ? 'bg-emerald-100 text-emerald-700' :
                    lock.status === 'unassigned' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {lock.status}
                  </span>
                </td>
                
                {/* Actions Column */}
                <td className="px-6 py-4 flex items-center gap-3">
                  {editingId !== lock._id && (
                    <button 
                      onClick={() => {
                        setEditingId(lock._id);
                        setEditName(lock.name);
                      }}
                      className="text-zinc-600 hover:text-zinc-900 font-medium text-xs"
                    >
                      Rename
                    </button>
                  )}
                  {lock.listingId && lock.listingId.slug && (
                    <Link 
                      href={`/admin/properties/${lock.listingId.slug}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 font-medium text-xs flex items-center gap-1"
                    >
                      Edit Property
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
