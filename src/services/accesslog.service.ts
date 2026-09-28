import { connectToDatabase } from "@/config/DbConnect";
import AccessLog from "@/models/accesslog";
import SmartLock from "@/models/smartlock";
import Property from "@/models/property";
import User from "@/models/user";

export async function getAccessLogsData() {
  await connectToDatabase();

  const rawLogs = await AccessLog.find()
    .populate({ path: 'propertyId', model: Property, select: 'location.region location.area location.city' })
    .populate({ path: 'actorId', model: User, select: 'name email phone profilePicture' })
    .populate({ path: 'lockId', model: SmartLock, select: 'tuyaDeviceId status' })
    .sort({ createdAt: -1 })
    .lean();

  return rawLogs.map((log: any) => {
    // Format location
    let propertyLocation = "Unknown Location";
    if (log.propertyId?.location) {
      const loc = log.propertyId.location;
      propertyLocation = `${loc.area || ''}${loc.city ? ', ' + loc.city : ''}${loc.region ? ', ' + loc.region : ''}`;
      propertyLocation = propertyLocation.replace(/^, /, '');
    }

    return {
      id: log._id.toString(),
      action: log.action || "UNKNOWN",
      actorType: log.actorType || "Unknown",
      performedBy: log.performedBy || "System",
      actor: log.actorId ? {
        id: log.actorId._id.toString(),
        name: log.actorId.name || "Unknown",
        email: log.actorId.email || "",
        profilePicture: log.actorId.profilePicture || "",
      } : null,
      property: log.propertyId ? {
        id: log.propertyId._id.toString(),
        location: propertyLocation,
      } : null,
      lock: log.lockId ? {
        id: log.lockId._id.toString(),
        deviceId: log.lockId.tuyaDeviceId || "Unknown Device",
      } : null,
      metadata: log.metadata ? {
        targetName: log.metadata.targetName,
        expiresAt: log.metadata.expiresAt ? new Date(log.metadata.expiresAt).toISOString() : undefined,
      } : null,
      createdAt: log.createdAt ? new Date(log.createdAt).toISOString() : new Date().toISOString(),
    };
  });
}
