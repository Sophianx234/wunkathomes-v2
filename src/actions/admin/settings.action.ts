"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Settings from "@/models/settings";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  await connectToDatabase();
  let settings = await Settings.findOne({ id: "global" }).lean();
  
  if (!settings) {
    settings = await Settings.create({ id: "global", tourAvailableDays: [1, 2, 3, 4, 5, 6] });
  }
  
  return JSON.parse(JSON.stringify(settings));
}

export async function updateTourAvailableDays(days: number[]) {
  await connectToDatabase();
  await Settings.findOneAndUpdate(
    { id: "global" },
    { tourAvailableDays: days },
    { upsert: true, new: true }
  );
  
  revalidatePath("/", "layout");
  return { success: true };
}

