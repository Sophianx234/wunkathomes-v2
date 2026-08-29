"use client"

import React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Helper function to format path segments (e.g., "tenant-management" -> "Tenant Management")
function formatSegment(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Helper to determine if a generated href actually has a page
function isClickableLink(href: string) {
  // List of known exact paths that are just layout wrappers without pages
  const unclickableExact = [
    "/admin/manage",
  ]
  
  if (unclickableExact.includes(href)) return false

  // Catch dynamic routes that don't have a root page
  // e.g., /admin/properties/[slug] has no page, only /admin/properties/[slug]/edit does
  const parts = href.split("/").filter(Boolean)
  if (parts.length === 3 && parts[0] === "admin" && parts[1] === "properties") {
    return false
  }

  return true
}

export function SiteHeader() {
  const pathname = usePathname()
  
  // Split the pathname into an array and filter out any empty strings
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        <Breadcrumb>
          <BreadcrumbList>
            {/* Always show Home as the root */}
            <BreadcrumbItem className="hidden md:block">
              {segments.length === 0 ? (
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href="/admin/overview">Dashboard</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {/* Render separators and dynamic path segments */}
            {segments.length > 0 && <BreadcrumbSeparator className="hidden md:block" />}
            
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1
              // Rebuild the URL path up to the current segment
              const href = `/${segments.slice(0, index + 1).join("/")}`
              const title = formatSegment(segment)
              const clickable = !isLast && isClickableLink(href)

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{title}</BreadcrumbPage>
                    ) : clickable ? (
                      <BreadcrumbLink className="hidden md:block" asChild>
                        <Link href={href}>{title}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="hidden md:block text-muted-foreground font-normal">
                        {title}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
