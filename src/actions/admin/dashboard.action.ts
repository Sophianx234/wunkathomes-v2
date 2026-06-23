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
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 2. Metrics & Aggregations (Running in parallel)
    const [
      monthlyRevenueRes,
      outstandingRentRes,
      unverifiedFundsRes,
      listingStats,
      tourStats,
      pendingBankTransfers,
      pendingKYC,            
      pendingLeases,         
      urgentMaintenance      
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { status: "Success", paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      Lease.aggregate([
        { $match: { status: { $in: ["Awaiting_Payment", "Active"] } } },
        { $group: { _id: null, total: { $sum: "$totalRentAmount" } } } 
      ]),

      Transaction.aggregate([
        { $match: { status: "Pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      Listing.aggregate([
        { $group: { 
            _id: null, 
            total: { $sum: 1 },
            rented: { $sum: { $cond: [{ $eq: ["$status", "Rented"] }, 1, 0] } },
            smartLocks: { $sum: { $cond: ["$smartLock.hasSmartLock", 1, 0] } }
        }}
      ]),

      Tour.countDocuments({ 
        scheduledDate: { $gte: startOfToday, $lt: new Date(startOfToday.getTime() + 86400000) },
        status: "Pending_Time"
      }),

      Transaction.countDocuments({ channel: "bank", status: "Pending" }),
      User.countDocuments({ kycStatus: "Pending" }),
      Lease.countDocuments({ status: { $in: ["Pending_Verification", "Awaiting_Admin_Approval"] } }),
      Maintenance.countDocuments({ priority: { $in: ["Emergency", "High"] }, status: "Pending" })
    ]);

    const metrics = {
      monthlyRevenue: monthlyRevenueRes[0]?.total || 0,
      revenueTrend: 8.2, 
      outstandingRent: outstandingRentRes[0]?.total || 0,
      unverifiedFunds: unverifiedFundsRes[0]?.total || 0,
      unverifiedTrend: -1.2,
      totalListings: listingStats[0]?.total || 0,
      rentedListings: listingStats[0]?.rented || 0,
      onlineLocks: listingStats[0]?.smartLocks || 0, 
      totalLocks: listingStats[0]?.smartLocks || 0,
      activeTours: await Tour.countDocuments({ status: { $in: ["Pending_Time", "Confirmed"] } }),
      
      toursToday: tourStats,
      pendingToursToday: tourStats, 
      pendingBankTransfers: pendingBankTransfers,
      pendingKYC: pendingKYC,
      pendingLeases: pendingLeases,
      urgentMaintenance: urgentMaintenance,
    };

    // 3. Recent Data Lists
    const [recentTransactions, dueRentsData, recentListingsData, recentReviewsData, propertyData] = await Promise.all([
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
      ])
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
      propertyTypeStats,
      assetChartData,
      revenueChartData
    };

  } catch (error) {
    console.error("[SYSTEM LOG] Dashboard Data Fetch Error:", error);
    throw new Error("Failed to load dashboard data"); 
  }
}
