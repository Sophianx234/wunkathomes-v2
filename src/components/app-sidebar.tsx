"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Building01Icon,
  UserGroupIcon,
  File01Icon,
  Wallet01Icon,
  Calendar01Icon,
  LockIcon,
  Settings05Icon,
  HelpCircleIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons";

// --- TYPES ---
interface AuthenticatedUser {
  name: string;
  email: string;
  avatar: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: AuthenticatedUser;
}

const data = {
  // Arranged logically: Platform -> People/Contracts -> Financial/Ops
  navMain: [
    {
      title: "Platform",
      items: [
        {
          title: "Dashboard",
          url: "/admin/overview",
          icon: <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />,
        },
        {
          title: "Properties",
          url: "/admin/properties",
          icon: <HugeiconsIcon icon={Building01Icon} strokeWidth={2} />,
        },
      ],
    },
    {
      title: "CRM & Leasing",
      items: [
        {
          title: "Tenant Management",
          url: "/admin/manage/tenants",
          icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
        },
        {
          title: "Tenant Onboarding",
          url: "/admin/manage/tenants/onboarding",
          icon: <HugeiconsIcon icon={File01Icon} strokeWidth={2} />,
        },
        {
          title: "Tour Management",
          url: "/admin/manage/tours",
          icon: <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          title: "Transaction Management",
          url: "/admin/manage/transactions",
          icon: <HugeiconsIcon icon={Wallet01Icon} strokeWidth={2} />,
        },

        {
          title: "Smartlock & Access",
          url: "/admin/manage/access-control",
          icon: <HugeiconsIcon icon={LockIcon} strokeWidth={2} />,
        },
        {
          title: "Support ",
          url: "/admin/manage/maintenance",
          icon: <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Search",
      url: "/admin/search",
      icon: <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    },
    {
      title: "Team Management",
      url: "/admin/manage/team",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
  ],
};

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link
                href="/admin/overview"
                className="flex items-center gap-2 font-bold text-lg z-50 group shrink-0"
              >
                <div className="relative size-10">
                  <Image
                    fill
                    alt="WunkatHomes logo"
                    src="/images/home.png"
                    className="object-contain size-10 transition-transform"
                  />
                </div>
                <span className="pt-2 text-primary hidden sm:block tracking-tight text-zinc-800">
                  Wunkat<span className="text-zinc-500">Homes</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Render nested grouped primary routes */}
        <NavMain items={data.navMain} />

        {/* Render utility routes at the bottom */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {/* Dynamically render the fresh user data */}
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
