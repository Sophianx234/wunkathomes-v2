"use server";

import { connectToDatabase } from "@/config/DbConnect";
import CleaningSchedule from "@/models/cleaning";
import Lease from "@/models/lease";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getCleaningSchedule() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();

    // Find the active lease
    const activeLease = await Lease.findOne({
      userId: session.userId,
      status: { $in: ["Active", "Awaiting_Admin_Approval", "Pending_Verification"] }
    }).sort({ createdAt: -1 });

    if (!activeLease) {
      return { success: false, message: "No active lease found." };
    }

    const schedule = await CleaningSchedule.findOne({
      leaseId: activeLease._id,
      userId: session.userId
    }).lean();

    if (!schedule) {
      return { success: true, data: null };
    }

    return { 
      success: true, 
      data: {
        id: schedule._id.toString(),
        scheduleType: schedule.scheduleType,
        customDates: schedule.customDates || [],
        weeklyDays: schedule.weeklyDays || [],
        status: schedule.status
      }
    };
  } catch (error) {
    console.error("Error fetching cleaning schedule:", error);
    return { success: false, message: "Failed to fetch schedule." };
  }
}

export async function updateCleaningSchedule(data: {
  scheduleType: "custom" | "daily" | "weekly";
  customDates?: string[];
  weeklyDays?: number[];
  status?: "active" | "paused" | "cancelled";
}) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, message: "Unauthorized" };
    }

    await connectToDatabase();

    // Find the active lease
    const activeLease = await Lease.findOne({
      userId: session.userId,
      status: { $in: ["Active", "Awaiting_Admin_Approval", "Pending_Verification"] }
    }).sort({ createdAt: -1 });

    if (!activeLease) {
      return { success: false, message: "No active lease found." };
    }

    let schedule = await CleaningSchedule.findOne({
      leaseId: activeLease._id,
      userId: session.userId
    });

    if (schedule) {
      // Update existing
      schedule.scheduleType = data.scheduleType;
      schedule.status = data.status || "active";
      if (data.scheduleType === "custom") {
        schedule.customDates = data.customDates ? data.customDates.map((d: string) => new Date(d)) : [];
        schedule.weeklyDays = [];
      } else if (data.scheduleType === "weekly") {
        schedule.weeklyDays = data.weeklyDays || [];
        schedule.customDates = [];
      } else {
        schedule.weeklyDays = [];
        schedule.customDates = [];
      }
      await schedule.save();
    } else {
      // Create new
      schedule = await CleaningSchedule.create({
        userId: session.userId,
        listingId: activeLease.listingId,
        leaseId: activeLease._id,
        scheduleType: data.scheduleType,
        customDates: data.scheduleType === "custom" && data.customDates ? data.customDates.map((d: string) => new Date(d)) : [],
        weeklyDays: data.scheduleType === "weekly" && data.weeklyDays ? data.weeklyDays : [],
        status: data.status || "active",
      });
    }

    revalidatePath("/user/dashboard");
    revalidatePath("/admin/manage/maintenance");

    return { success: true, message: "Cleaners will be dispatched on the scheduled day(s)." };
  } catch (error) {
    console.error("Error updating cleaning schedule:", error);
    return { success: false, message: "Failed to update schedule." };
  }
}
