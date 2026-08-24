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
import { ShieldAlert, Fingerprint, Activity } from 'lucide-react';
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
              <div className="flex flex-col">
                {auditLogs.map((log) => {
                  const isAlarm = log.action.includes('ALARM');
                  const isSystem = !log.actorId && log.actorType === 'Hardware';
                  
                  return (
                    <div key={log._id} className="group relative flex gap-4 p-4 hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                      {/* Avatar Column */}
                      <div className="flex-shrink-0 pt-0.5">
                        {log.actorId ? (
                          <Avatar className="h-8 w-8 ring-1 ring-zinc-200">
                            <AvatarImage src={log.actorId.profilePicture} alt={log.actorId.name} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium text-xs">
                              {log.actorId.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ) : isAlarm ? (
                          <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 ring-1 ring-rose-200">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 ring-1 ring-zinc-200">
                            <Activity className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content Column */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-zinc-900 truncate">
                                {log.actorId ? log.actorId.name : log.performedBy || 'System Event'}
                              </span>
                              {log.actorId?.role && (
                                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider text-zinc-500 bg-zinc-100">
                                  {log.actorId.role}
                                </Badge>
                              )}
                              {isSystem && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-medium uppercase tracking-wider text-zinc-500">
                                  Hardware
                                </Badge>
                              )}
                            </div>
                            
                            {/* User Contact Info */}
                            {log.actorId && (log.actorId.email || log.actorId.phone) && (
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5">
                                {log.actorId.email && <span>{log.actorId.email}</span>}
                                {log.actorId.email && log.actorId.phone && <span className="text-zinc-300">•</span>}
                                {log.actorId.phone && <span>{log.actorId.phone}</span>}
                              </div>
                            )}
                          </div>
                          
                          <span className="text-[11px] text-zinc-400 whitespace-nowrap font-mono mt-0.5">
                            {new Date(log.createdAt).toLocaleString(undefined, { 
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                            })}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`text-[12px] ${isAlarm ? 'text-rose-600 font-semibold' : 'text-zinc-700 font-medium'}`}>
                            {log.action.replace(/_/g, ' ')}
                          </span>
                          
                          {log.metadata?.targetName && (
                            <code className="text-[10px] bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600 max-w-[150px] truncate">
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
