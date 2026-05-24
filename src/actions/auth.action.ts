"use server"

import { connectToDatabase } from "@/config/DbConnect"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  countryCode: z.string(),
  phoneNumber: z.string().min(10, "Phone number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function signupAction(prevState: any, formData: FormData) {
  try {
    // 1. Validate form data
    const validatedFields = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      countryCode: formData.get("countryCode"),
      phoneNumber: formData.get("phoneNumber"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: validatedFields.error.errors[0].message,
      }
    }

    const { name, email, countryCode, phoneNumber, password } = validatedFields.data

    // 2. Format phone number (combine code and remove spaces)
    const fullPhone = countryCode + phoneNumber.replace(/\s/g, "")

    // 3. Connect to database
    await connectToDatabase()

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return {
        success: false,
        error: "Email already registered",
      }
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 6. Create user
    const newUser = await User.create({
      name,
      email,
      phone: fullPhone,
      password: hashedPassword,
      role: "User",
      accountStatus: "Active",
      kycStatus: "Unverified",
    })

    // 7. Create JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    )

    // 8. Set cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // 9. Return success payload instead of redirecting
    return { 
      success: true, 
      message: "Account created successfully!" 
    }
  
  } catch (error: any) {
    console.error("Signup error:", error)
    return { 
      success: false, 
      error: error.message || "Something went wrong. Please try again." 
    }
  }
}