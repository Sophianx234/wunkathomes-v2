"use server";

import { connectToDatabase } from "@/config/DbConnect";
import Inquiry from "@/models/inquiry";
import { getSession } from "@/lib/session";

export async function submitInquiry(formData: {
  name: string;
  email: string;
  message: string;
}) {
  try {
    const session = await getSession();
    const isGuest = !session || !session.userId;
    const userId = session?.userId || null;
    
    await connectToDatabase();

    let { name, email, message } = formData;

    if (!isGuest && session) {
      // Zero Trust: Override any frontend payload with trusted backend session claims
      name = session.name || "Authenticated User";
      email = session.email || "unknown@email.com";
    } else {
      // Guest validation
      if (!name?.trim() || !email?.trim()) {
        return { success: false, message: "Name and email are required for guests." };
      }
    }

    if (!message?.trim()) {
      return { success: false, message: "Message is required." };
    }

    let newInquiry;
    try {
      newInquiry = await Inquiry.create({
        name,
        email,
        message,
        userId: userId || null,
        isGuest,
      });
    } catch (dbError: any) {
      console.error("INQUIRY SUBMISSION ERROR:", dbError);
      throw new Error(dbError.message || "Database validation failed.");
    }

    return {
      success: true,
      message: "Your message has been sent successfully. Our team will get back to you shortly.",
      data: JSON.parse(JSON.stringify(newInquiry)),
    };
  } catch (error: any) {
    console.error("INQUIRY SUBMISSION ERROR:", error);
    return {
      success: false,
      message: error.message || "An error occurred while sending your message. Please try again.",
    };
  }
}
