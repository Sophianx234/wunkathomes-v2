'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { remoteUnlockAction, generateVendorPinAction, revokeTemporaryPinAction, getLockAuditLogs } from '@/actions/admin/smartlock.action';

export function SmartLockManageDialog({
  lock,
  isOpen,
  onClose,
}: {
  lock: any | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [vendorName, setVendorName] = useState('');
  const [vendorHours, setVendorHours] = useState(2);
  const [newPin, setNewPin] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (isOpen && lock?._id) {
      setLoadingLogs(true);
      getLockAuditLogs(lock._id).then(res => {
        if (res.success && res.logs) setAuditLogs(res.logs);
        setLoadingLogs(false);
      });
    }
  }, [isOpen, lock?._id]);

  if (!lock) return null;

  const [unlockCountdown, setUnlockCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (unlockCountdown !== null && unlockCountdown > 0) {
      const timer = setTimeout(() => setUnlockCountdown(c => (c ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (unlockCountdown === 0) {
      setUnlockCountdown(null);
    }
  }, [unlockCountdown]);

  const handleRemoteUnlock = () => {
    startTransition(async () => {
      const res = await remoteUnlockAction(lock.tuyaDeviceId);
      if (res.success) {
        toast.success('Lock opened successfully.');
        setUnlockCountdown(5);
      } else {
        toast.error(res.error || 'Failed to unlock door.');
      }
    });
  };

  const handleGeneratePin = () => {
    if (!vendorName.trim()) {
      toast.error('Please enter a name for the PIN.');
      return;
    }
    startTransition(async () => {
      const res = await generateVendorPinAction(lock.tuyaDeviceId, vendorHours, vendorName.trim());
      if (res?.success) {
        setNewPin(res.pin as string);
        setVendorName('');
        setVendorHours(2);
        toast.success('Temporary PIN created.');
      } else {
        toast.error(res?.error || 'Failed to generate PIN.');
      }
    });
  };

  const handleRevoke = (pinId: string) => {
    startTransition(async () => {
      const res = await revokeTemporaryPinAction(lock.tuyaDeviceId, pinId);
      if (res?.success) {
        toast.success('PIN revoked successfully.');
      } else {
        toast.error(res?.error || 'Failed to revoke PIN.');
      }
    });
  };

  const activePins = (lock.activeTempPins || []).filter((p: any) => p.expiresAt && new Date(p.expiresAt) > new Date());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden font-sans bg-zinc-50 border-zinc-200">
        <DialogHeader className="p-6 bg-white border-b border-zinc-200">
          <DialogTitle className="text-xl text-zinc-900">{lock.name}</DialogTitle>
          <DialogDescription className="text-[13px] text-zinc-500 font-mono mt-1">
            {lock.tuyaDeviceId}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="controls" className="w-full">
          <div className="px-6 pt-4 bg-zinc-50">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="controls">Access Controls</TabsTrigger>
              <TabsTrigger value="audit">Audit History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="controls" className="p-6 space-y-8 overflow-y-auto max-h-[60vh] mt-0">
            {/* Quick Actions */}
            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Quick Actions</h3>
              <div className="p-4 bg-white rounded-lg border border-zinc-200 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-zinc-900">Remote Unlock</p>
                  <p className="text-[11px] text-zinc-500">Trigger the lock mechanism instantly.</p>
                </div>
                <button
                  onClick={handleRemoteUnlock}
                  disabled={isPending || lock.status !== 'online' || unlockCountdown !== null}
                  className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors ${
                    unlockCountdown !== null 
                      ? 'bg-emerald-100 text-emerald-700 w-40 text-center' 
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {isPending ? 'Working...' : unlockCountdown !== null ? `Unlocked (${unlockCountdown}s)` : 'Unlock Door'}
                </button>
              </div>
            </section>

            {/* New PIN */}
            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Issue Temporary Access</h3>
              <div className="p-4 bg-white rounded-lg border border-zinc-200 space-y-4">
                {newPin ? (
                  <div className="bg-zinc-50 border border-zinc-200 rounded p-4 text-center">
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2">New Access Code</p>
                    <p className="font-mono text-2xl font-bold tracking-widest text-zinc-900">{newPin}</p>
                    <p className="text-[11px] text-rose-600 mt-2">Copy this code now. It will not be shown again.</p>
                    <button onClick={() => setNewPin(null)} className="mt-4 text-xs font-semibold text-zinc-600 underline">Dismiss</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Name / Purpose</label>
                        <Input
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          placeholder="e.g. Cleaner"
                          className="h-8 text-[13px]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Duration (Hours)</label>
                        <Select value={vendorHours.toString()} onValueChange={(v) => setVendorHours(Number(v))}>
                          <SelectTrigger className="h-8 text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Hour</SelectItem>
                            <SelectItem value="2">2 Hours</SelectItem>
                            <SelectItem value="4">4 Hours</SelectItem>
                            <SelectItem value="8">8 Hours</SelectItem>
                            <SelectItem value="24">24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button
                      onClick={handleGeneratePin}
                      disabled={isPending || lock.status !== 'online'}
                      className="w-full bg-black text-white hover:bg-zinc-800 h-9 rounded text-[13px] font-medium disabled:opacity-50"
                    >
                      Generate PIN
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Active PINs */}
            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Active Temporary PINs</h3>
              <div className="space-y-2">
                {activePins.length === 0 ? (
                  <p className="text-[13px] text-zinc-500 text-center py-4 border border-dashed border-zinc-200 rounded-lg">No active temporary PINs.</p>
                ) : (
                  activePins.map((pin: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-lg">
                      <div>
                        <p className="text-[13px] font-medium text-zinc-900">{pin.name}</p>
                        <p className="text-[11px] text-zinc-500">Expires {new Date(pin.expiresAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="text-[11px] font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-700">{pin.pinMasked}</code>
                        <button
                          onClick={() => handleRevoke(pin.pinId)}
                          disabled={isPending}
                          className="text-[11px] font-bold text-rose-600 hover:underline disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="audit" className="p-0 m-0 overflow-y-auto max-h-[60vh]">
            {loadingLogs ? (
              <div className="p-12 text-center text-sm text-zinc-500">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-500">No events logged yet.</div>
            ) : (
              <ul className="divide-y divide-zinc-200">
                {auditLogs.map((log) => (
                  <li key={log._id} className="p-4 hover:bg-white transition-colors text-sm flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-semibold ${log.action.includes('ALARM') ? 'text-rose-600' : 'text-zinc-900'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-600 text-xs">By: {log.performedBy || 'System'}</span>
                      {log.metadata?.targetName && (
                        <code className="text-[10px] bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">
                          {log.metadata.targetName}
                        </code>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
