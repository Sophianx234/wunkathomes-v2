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
  ...props
}: PhoneInputProps) {
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, "")
    
    // Limit to 10 digits
    const limited = digits.slice(0, 10)
    
    // Format as XX XXX XXXX
    if (limited.length <= 2) {
      return limited
    } else if (limited.length <= 5) {
      return `${limited.slice(0, 2)} ${limited.slice(2)}`
    } else {
      return `${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange?.(formatted)
  }

  return (
    <div className="flex gap-2">
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
        className={cn("flex-1 bg-background rounded-md", className)}
        placeholder="XX XXX XXXX"
      />
    </div>
  )
}