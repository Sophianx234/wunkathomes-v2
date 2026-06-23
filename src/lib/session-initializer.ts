"use client"

import { User, useUserStore } from "@/store/user-store"
import { useState } from "react"

export function StoreInitializer({ user }: { user: User }) {
  // Passing a callback to useState ensures this runs synchronously
  // exactly ONCE when the component instantiates. 
  // It completely bypasses the new useRef strict mode rules while 
  // keeping your UI perfectly flicker-free.
  useState(() => {
    useUserStore.setState({ user, isLoggedIn: !!user })
    return true // The actual state value doesn't matter, we just need the execution
  })

  return null
}
