'use client';

import { useState, useTransition, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { remoteUnlockAction, generateVendorPinAction, revokeTemporaryPinAction, getLockAuditLogs } from '@/actions/admin/smartlock.action';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Fingerprint, Activity, Lock } from 'lucide-react';
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

  const fetchLogs = async () => {
    if (!lock?._id) return;
    const res = await getLockAuditLogs(lock._id);
    if (res.success && res.logs) setAuditLogs(res.logs);
  };

  useEffect(() => {
    if (isOpen && lock?._id) {
      setLoadingLogs(true);
      fetchLogs().finally(() => setLoadingLogs(false));
    }
  }, [isOpen, lock?._id]);

  const [unlockCountdown, setUnlockCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (unlockCountdown !== null && unlockCountdown > 0) {
      const timer = setTimeout(() => setUnlockCountdown(c => (c ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (unlockCountdown === 0) {
      setUnlockCountdown(null);
    }
  }, [unlockCountdown]);

  if (!lock) return null;

  const handleRemoteUnlock = () => {
    startTransition(async () => {
      const res = await remoteUnlockAction(lock.tuyaDeviceId);
      if (res.success) {
        toast.success('Lock opened successfully.');
        setUnlockCountdown(5);
        fetchLogs();
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
        fetchLogs();
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
        fetchLogs();
      } else {
        toast.error(res?.error || 'Failed to revoke PIN.');
      }
    });
  };

  const activePins = (lock.activeTempPins || []).filter((p: any) => p.expiresAt && new Date(p.expiresAt) > new Date());

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden font-sans bg-zinc-50 border-zinc-200/80 rounded-2xl shadow-xl">
        <DialogHeader className="p-5 bg-white border-b border-zinc-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700 border border-zinc-200/60">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-900 tracking-tight">{lock.name}</DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 font-mono mt-0.5">
                Tuya ID: {lock.tuyaDeviceId}
              </DialogDescription>
            </div>
          </div>
          <Badge variant="outline" className={`capitalize font-medium text-xs ${
            lock.status === 'online' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-zinc-200 text-zinc-600 bg-zinc-100'
          }`}>
            {lock.status}
          </Badge>
        </DialogHeader>

        <Tabs defaultValue="controls" className="w-full">
          <div className="px-6 pt-4 bg-zinc-50">
            <TabsList className="grid w-full rounded-xl grid-cols-2 bg-zinc-200/60 p-1 h-9">
              <TabsTrigger value="controls" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs transition-all active:scale-95">Access Controls</TabsTrigger>
              <TabsTrigger value="audit" className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs transition-all active:scale-95">Audit History</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="controls" className="p-6 space-y-6 overflow-y-auto max-h-[60vh] mt-0 outline-none">
            {/* Quick Actions */}
            <section>
              <h3 className="text-xs font-semibold text-zinc-900 mb-2.5">Instant Controls</h3>
              <div className="p-4 bg-white rounded-xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-900">Remote Unlock</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Trigger the physical latch mechanism immediately.</p>
                </div>
                <button
                  onClick={handleRemoteUnlock}
                  disabled={isPending || lock.status !== 'online' || unlockCountdown !== null}
                  className={`px-4 h-9 rounded-lg text-xs font-medium disabled:opacity-50 transition-all active:scale-[0.98] shadow-2xs ${
                    unlockCountdown !== null 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 w-36 text-center font-medium' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {isPending ? 'Unlocking...' : unlockCountdown !== null ? `Unlocked (${unlockCountdown}s)` : 'Unlock Door'}
                </button>
              </div>
            </section>

            {/* New PIN */}
            <section>
              <h3 className="text-xs font-semibold text-zinc-900 mb-2.5">Issue Temporary Access</h3>
              <div className="p-4 bg-white rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
                {newPin ? (
                  <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-zinc-500 mb-1.5">New Access Code Generated</p>
                    <p className="font-mono text-2xl font-semibold tracking-widest text-zinc-900 tabular-nums">{newPin}</p>
                    <p className="text-xs text-zinc-500 mt-1.5">Copy or send this code now. It will not be shown again.</p>
                    <button onClick={() => setNewPin(null)} className="mt-3 text-xs font-medium text-zinc-600 hover:text-zinc-900 underline">Dismiss</button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Name / Purpose</label>
                        <Input
                          value={vendorName}
                          onChange={(e) => setVendorName(e.target.value)}
                          placeholder="e.g. Cleaner / Plumber"
                          className="h-9 text-xs rounded-lg border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-zinc-600 mb-1.5 block">Duration (Hours)</label>
                        <Select value={vendorHours.toString()} onValueChange={(v) => setVendorHours(Number(v))}>
                          <SelectTrigger className="h-9 text-xs rounded-lg border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 outline-none transition-all">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-zinc-200 shadow-md">
                            <SelectItem value="1" className="text-xs rounded-md">1 Hour</SelectItem>
                            <SelectItem value="2" className="text-xs rounded-md">2 Hours</SelectItem>
                            <SelectItem value="4" className="text-xs rounded-md">4 Hours</SelectItem>
                            <SelectItem value="8" className="text-xs rounded-md">8 Hours</SelectItem>
                            <SelectItem value="24" className="text-xs rounded-md">24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <button
                      onClick={handleGeneratePin}
                      disabled={isPending || lock.status !== 'online'}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-9 rounded-lg text-xs font-medium disabled:opacity-50 active:scale-[0.98] transition-all shadow-xs"
                    >
                      Generate PIN
                    </button>
                  </>
                )}
              </div>
            </section>

            {/* Active PINs */}
            <section>
              <h3 className="text-xs font-semibold text-zinc-900 mb-2.5">Active Temporary Credentials</h3>
              <div className="space-y-2">
                {activePins.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-6 border border-dashed border-zinc-200 rounded-xl bg-white/60">No active temporary PINs.</p>
                ) : (
                  activePins.map((pin: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
                      <div>
                        <p className="text-xs font-medium text-zinc-900">{pin.name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">Expires {new Date(pin.expiresAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <code className="text-xs font-mono bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-md text-zinc-700 tabular-nums">{pin.pinMasked}</code>
                        <button
                          onClick={() => handleRevoke(pin.pinId)}
                          disabled={isPending}
                          className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline disabled:opacity-50 transition-colors"
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

          <TabsContent value="audit" className="p-0 m-0 overflow-y-auto max-h-[60vh] outline-none">
            {loadingLogs ? (
              <div className="p-12 text-center text-xs text-zinc-500">Loading audit trail...</div>
            ) : auditLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-500">No events logged yet for this device.</div>
            ) : (
              <div className="flex flex-col divide-y divide-zinc-100">
                {auditLogs.map((log) => {
                  const isAlarm = log.action.includes('ALARM');
                  const isSystem = !log.actorId && log.actorType === 'Hardware';
                  
                  return (
                    <div key={log._id} className="group relative flex gap-3.5 p-4 hover:bg-zinc-50/70 transition-colors">
                      {/* Avatar Column */}
                      <div className="shrink-0 pt-0.5">
                        {log.actorId ? (
                          <Avatar className="h-8 w-8 rounded-lg ring-1 ring-zinc-200">
                            <AvatarImage src={log.actorId.profilePicture} alt={log.actorId.name} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium text-xs rounded-lg">
                              {log.actorId.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : isAlarm ? (
                          <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center ring-1 ring-rose-200/80">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 ring-1 ring-zinc-200">
                            <Activity className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-900 truncate">
                                {log.actorId ? log.actorId.name : log.performedBy || 'System Event'}
                              </span>
                              {log.actorId?.role && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider text-zinc-500 bg-zinc-100 border border-zinc-200/60 rounded">
                                  {log.actorId.role}
                                </Badge>
                              )}
                              {isSystem && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider text-zinc-500 rounded">
                                  Hardware
                                </Badge>
                              )}
                            </div>
                            
                            {/* User Contact Info */}
                            {log.actorId && (log.actorId.email || log.actorId.phone) && (
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5 font-mono">
                                {log.actorId.email && <span>{log.actorId.email}</span>}
                                {log.actorId.email && log.actorId.phone && <span className="text-zinc-300">•</span>}
                                {log.actorId.phone && <span>{log.actorId.phone}</span>}
                              </div>
                            )}
                          </div>
                          
                          <span className="text-[11px] text-zinc-400 whitespace-nowrap font-mono tabular-nums mt-0.5">
                            {new Date(log.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${isAlarm ? 'text-rose-600 font-semibold' : 'text-zinc-700 font-medium'}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          
                          {log.metadata?.targetName && (
                            <code className="text-[10px] bg-zinc-100 border border-zinc-200/60 px-1.5 py-0.5 rounded text-zinc-600 font-mono max-w-[150px] truncate">
                              {log.metadata.targetName}
                            </code>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
