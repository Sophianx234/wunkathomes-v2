// components/ui/phone-input.tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const countries = [
  { code: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
] as const

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  countryCode?: string
  onCountryCodeChange?: (code: string) => void
}

export function PhoneInput({
  className,
  value = "",
  onChange,
  countryCode = "+233",
  onCountryCodeChange,
  name,
  ...props
}: PhoneInputProps) {
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "")
    // Limit to 15 digits to match Zod schema
    const limited = digits.slice(0, 15)
    
    // Format dynamically based on length
    if (limited.length <= 3) {
      return limited
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`
    } else if (limited.length <= 10) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6, 10)} ${limited.slice(10)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange?.(formatted)
  }

  const rawDigits = value.replace(/\D/g, "")

  return (
    <div className="flex gap-2">
      {name && <input type="hidden" name={name} value={rawDigits} />}
      <Select value={countryCode} onValueChange={onCountryCodeChange}>
        <SelectTrigger className="w-[140px] bg-background rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span>{country.flag}</span>
                <span>{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        {...props}
        type="tel"
        value={value}
        onChange={handlePhoneChange}
        className={cn("flex-2 bg-background rounded-md", className)}
        placeholder="XX XXX XXXX"
      />
    </div>
  )
}
