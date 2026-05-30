"use server"

import { connectToDatabase } from "@/config/DbConnect"
import { getSession } from "@/lib/session"
import SavedProperty from "@/models/saved";
import { revalidatePath } from "next/cache"

export type SaveActionState = {
  success: boolean;
  message: string;
  error: string;
  isSaved?: boolean;
};

export async function toggleSavePropertyAction(propertyId: string): Promise<SaveActionState> {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return { success: false, message: "", error: "You must be logged in to save properties." }
    }

    await connectToDatabase()

    // Check if it's already saved
    const existingSave = await SavedProperty.findOne({
      user: session.userId,
      property: propertyId
    })

    if (existingSave) {
      // Un-save it
      await SavedProperty.findByIdAndDelete(existingSave._id)
      revalidatePath("/user/saved") // Revalidate the saved properties page
      return { 
        success: true, 
        message: "Property removed from saved homes.", 
        error: "", 
        isSaved: false 
      }
    } else {
      // Save it
      await SavedProperty.create({
        user: session.userId,
        property: propertyId
      })
      revalidatePath("/user/saved") 
      return { 
        success: true, 
        message: "Property saved successfully!", 
        error: "", 
        isSaved: true 
      }
    }
  } catch (error: any) {
    console.error("Toggle Save Error:", error)
    return { success: false, message: "", error: "An unexpected error occurred." }
  }
}