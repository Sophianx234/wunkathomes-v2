"use server"

import { connectToDatabase } from "@/config/DbConnect"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { createSession, deleteSession } from "@/lib/session" // Import the helper
import { redirect } from "next/navigation"

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

    // 2. Format phone number
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

    // 7. Invoke the Session Helper
    await createSession({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    })

    // 8. Return success payload
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


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function loginAction(prevState: any, formData: FormData) {
  try {
    // 1. Validate inputs
    const validatedFields = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Please enter a valid email and password.",
      }
    }

    const { email, password } = validatedFields.data

    // 2. Connect to DB
    await connectToDatabase()

    // 3. Find User
    // We use .select('+password') in case your schema hides the password field by default
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password.",
      }
    }

    // 4. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password.",
      }
    }

    // 5. Create Session
    await createSession({
      userId: user._id,
      email: user.email,
      role: user.role,
    })

    // 6. Return success
    return { 
      success: true, 
      message: "Welcome back!" 
    }

  } catch (error: any) {
    console.error("Login error:", error)
    return { 
      success: false, 
      error: "An unexpected error occurred. Please try again." 
    }
  }
}

export async function logoutAction() {
  // Destroy the secure HTTP-only cookie
  await deleteSession()
  
  // Redirect to the homepage
  redirect("/")
}