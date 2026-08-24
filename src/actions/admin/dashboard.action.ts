"use server";

import { connectToDatabase } from "@/config/DbConnect";
import { getSession } from "@/lib/session";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import Property from "@/models/property";
import Review from "@/models/review";
import Tour from "@/models/tour";
import Transaction from "@/models/transaction";
import User from "@/models/user"; 
import Maintenance from "@/models/maintenance"; 
import SmartLock from "@/models/smartlock";
import AccessLog from "@/models/accesslog";

export async function getDashboardData() {
  // 1. STRICT ZERO-TRUST AUTHORIZATION (CRITICAL FIX)
  const session = await getSession();
  if (!session?.userId || !['Admin', 'Manager'].includes(session.role)) {
    console.error(`[SECURITY LOG] Unauthorized dashboard access attempt. (User: ${session?.userId || 'Guest'})`);
    throw new Error("UNAUTHORIZED_ACCESS"); 
  }

  try {
    await connectToDatabase();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 2. Metrics & Aggregations (Running in parallel)
    const [
      monthlyRevenueRes,
      lastMonthRevenueRes,
      activeTenanciesCount,
      openWorkOrdersCount,
      listingStats,
      tourStats,
      pendingBankTransfers,
      pendingKYC,            
      pendingLeases,         
      urgentMaintenance,
      smartLockStats
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: "Success", paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      Transaction.aggregate([
        { $match: { status: "Success", paidAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      Lease.countDocuments({ status: "Active" }),

      Maintenance.countDocuments({ status: { $in: ["Pending", "In_Progress"] } }),

      Listing.aggregate([
        { $group: { 
            _id: null, 
            total: { $sum: 1 },
            rented: { $sum: { $cond: [{ $eq: ["$status", "Rented"] }, 1, 0] } }
        }}
      ]),

      Tour.countDocuments({ 
        scheduledDate: { $gte: startOfToday, $lt: new Date(startOfToday.getTime() + 86400000) },
        status: "Pending_Time"
      }),

      Transaction.countDocuments({ channel: "bank", status: "Pending" }),
      User.countDocuments({ kycStatus: "Pending" }),
      Lease.countDocuments({ status: { $in: ["Pending_Verification", "Awaiting_Admin_Approval"] } }),
      Maintenance.countDocuments({ priority: { $in: ["Emergency", "High"] }, status: "Pending" }),
      
      SmartLock.aggregate([
        { $group: { 
            _id: null, 
            total: { $sum: 1 },
            online: { $sum: { $cond: [{ $eq: ["$status", "online"] }, 1, 0] } },
            offline: { $sum: { $cond: [{ $eq: ["$status", "offline"] }, 1, 0] } }
        }}
      ])
    ]);

    const currentRevenue = monthlyRevenueRes[0]?.total || 0;
    const lastRevenue = lastMonthRevenueRes[0]?.total || 0;
    let revTrend = 0;
    if (lastRevenue > 0) {
      revTrend = Number((((currentRevenue - lastRevenue) / lastRevenue) * 100).toFixed(1));
    } else if (currentRevenue > 0) {
      revTrend = 100;
    }

    const metrics = {
      monthlyRevenue: currentRevenue,
      revenueTrend: revTrend, 
      activeTenancies: activeTenanciesCount,
      openWorkOrders: openWorkOrdersCount,
      totalListings: listingStats[0]?.total || 0,
      rentedListings: listingStats[0]?.rented || 0,
      totalLocks: smartLockStats[0]?.total || 0,
      onlineLocks: smartLockStats[0]?.online || 0,
      offlineLocks: smartLockStats[0]?.offline || 0,
      activeTours: await Tour.countDocuments({ status: { $in: ["Pending_Time", "Confirmed"] } }),
      
      toursToday: tourStats,
      pendingToursToday: tourStats, 
      pendingBankTransfers: pendingBankTransfers,
      pendingKYC: pendingKYC,
      pendingLeases: pendingLeases,
      urgentMaintenance: urgentMaintenance,
    };

    // 3. Recent Data Lists
    const [recentTransactions, dueRentsData, recentListingsData, recentReviewsData, propertyData, recentSecurityEventsData] = await Promise.all([
      Transaction.find().sort({ createdAt: -1 }).limit(4).populate('userId', 'name').populate('listingId', 'title'),
      Lease.find({ status: { $in: ["Awaiting_Payment", "Pending_Verification"] } })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate('userId', 'name')
        .populate('listingId', 'title'),
      Listing.find().sort({ createdAt: -1 }).limit(4).populate('propertyId', 'location'),
      Review.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name email profilePicture').populate('listingId', 'title'),
      Property.aggregate([
        { $group: { _id: "$propertyType", total: { $sum: 1 } } }
      ]),
      AccessLog.find().sort({ createdAt: -1 }).limit(5).populate('actorId', 'name email profilePicture role').populate('lockId', 'name').lean()
    ]);

    // Transform Data
    const recentPayments = recentTransactions.map(t => ({
      id: t._id.toString(),
      tenant: t.userId?.name || "Unknown User",
      target: t.listingId?.title || "Property",
      amount: t.amount,
      method: t.channel === "card" || t.channel === "mobile_money" ? "Paystack" : "Bank_Transfer",
      status: t.status === "Pending" ? "Pending_Verification" : "Completed",
      time: new Date(t.createdAt).toLocaleDateString(), 
    }));

    const dueRents = dueRentsData.map(l => ({
      id: l._id.toString(),
      tenant: l.userId?.name || "Unknown User",
      target: l.listingId?.title || "Property",
      amountDue: l.totalRentAmount,
      dueDate: "Action Required", 
      status: l.status === "Awaiting_Payment" ? "Overdue" : "Upcoming"
    }));

    const recentListings = recentListingsData.map(l => ({
      id: l._id.toString(),
      title: l.title,
      locationArea: l.propertyId?.location?.area || "Unknown",
      price: l.price,
      status: l.status,
      image: l.images[0] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop",
      slug: l.slug
    }));

    const recentReviews = recentReviewsData.map(r => ({
      id: r._id.toString(),
      user: { 
        name: r.userId?.name || "Anonymous", 
        email: r.userId?.email || "", 
        avatar: r.userId?.profilePicture || "" 
      },
      property: { name: r.listingId?.title || "Unknown Property", unit: "" },
      rating: r.rating,
      comment: r.comment || "No comment provided.",
      date: new Date(r.createdAt).toLocaleDateString(),
      status: "Published" 
    }));

    const propertyTypeStats = propertyData.map(p => ({
      type: p._id.replace('_', ' '),
      total: p.total,
      occupied: Math.floor(p.total * 0.8) 
    }));

    const recentSecurityEvents = recentSecurityEventsData.map((log: any) => ({
      id: log._id.toString(),
      lockName: log.lockId?.name || "Unknown Lock",
      action: log.action,
      actorName: log.actorId?.name || log.performedBy || "System",
      actorRole: log.actorId?.role || (log.actorType === 'Hardware' ? 'Hardware' : ''),
      actorEmail: log.actorId?.email || null,
      actorPhone: log.actorId?.phone || null,
      avatar: log.actorId?.profilePicture || null,
      timestamp: new Date(log.createdAt).toLocaleString(undefined, { 
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
      }),
      isAlarm: log.action.includes('ALARM')
    }));

    // 4. Chart Data Generation
    const assetAggregations = await Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const assetChartData = [
      { status: "Rented", count: assetAggregations.find(a => a._id === "Rented")?.count || 0, fill: "var(--foreground)" },
      { status: "Pending", count: assetAggregations.find(a => a._id === "Pending")?.count || 0, fill: "var(--muted-foreground)" },
      { status: "Available", count: assetAggregations.find(a => a._id === "Available")?.count || 0, fill: "#FDE047" },
    ];

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const revenueStats = await Transaction.aggregate([
      { $match: { status: "Success", paidAt: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: { _id: { month: { $month: "$paidAt" }, channel: "$channel" }, totalAmount: { $sum: "$amount" } } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueChartData = monthNames.map(month => ({ month, Paystack: 0, Bank_Transfer: 0 }));

    revenueStats.forEach(stat => {
      const monthIndex = stat._id.month - 1; 
      const amount = stat.totalAmount;
      const channel = stat._id.channel;

      if (channel === 'bank') {
        revenueChartData[monthIndex].Bank_Transfer += amount;
      } else if (channel === 'card' || channel === 'mobile_money') {
        revenueChartData[monthIndex].Paystack += amount;
      }
    });

    return {
      metrics,
      recentPayments,
      dueRents,
      recentListings,
      recentReviews,
      recentSecurityEvents,
      propertyTypeStats,
      assetChartData,
      revenueChartData
    };

  } catch (error) {
    console.error("[SYSTEM LOG] Dashboard Data Fetch Error:", error);
    throw new Error("Failed to load dashboard data"); 
  }
}
