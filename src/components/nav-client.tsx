"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  BitcoinTagIcon,
  Building05Icon,
  Cancel01Icon,
  CreditCardPosIcon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  FavouriteIcon,
  File01Icon,
  GlobalSearchIcon,
  Home09Icon,
  House02FreeIcons,
  House03Icon,
  Key02Icon,
  Map,
  Menu01Icon,
  OfficeChairIcon,
  Search01Icon,
  Settings01Icon,
  Store01Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LoginModal } from "./login-modal";
import { logoutAction } from "@/actions/user/auth.action";
import { LogoutButton } from "./logout-button";

// Update the interface to accept our precise indicator states
interface NavbarUser {
  name: string;
  email: string;
  profilePicture: string | null;
  indicators: {
    kycPending: boolean;
    signaturePending: boolean;
    newSaved: boolean;
  };
}

interface NavbarClientProps {
  user: NavbarUser | null;
}

export default function NavbarClient({ user }: NavbarClientProps) {
  const isLoggedIn = !!user;

  // Master check: Does the avatar need a red dot?
  const hasAnyPendingAction = user ? (user.indicators.kycPending || user.indicators.signaturePending || user.indicators.newSaved) : false;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [propertiesHovered, setPropertiesHovered] = useState(false);
  const [exploreHovered, setExploreHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  const profileRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setMenuOpen(false);
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 sm:h-20 z-50 transition-colors duration-300 ${
        isScrolled
          ? "bg-white border-b border-border shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          
          {/* 1. Logo (Left) */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg z-50 group shrink-0">
            <div className="relative size-10">
              <Image fill alt="WunkatHomes logo" src="/images/home.png" className="object-contain size-10 transition-transform" />
            </div>
            <span className="pt-2 text-primary  sm:block tracking-tight text-slate-800">
              Wunkat<span className="text-slate-500">Homes</span>
            </span>
          </Link>

          {/* 2. Center Navigation Links with Dropdowns */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm h-full">
            <Link href="/" className="text-slate-600 flex items-center gap-1.5 justify-center hover:text-slate-900 transition">
              <HugeiconsIcon icon={Home09Icon} size={18} /> Home
            </Link>

            {/* Properties Dropdown */}
            <div
              className="relative flex items-center h-full"
              onMouseEnter={() => setPropertiesHovered(true)}
              onMouseLeave={() => setPropertiesHovered(false)}
            >
              <Link href="/properties" className="text-slate-600 flex items-center gap-1.5 justify-center hover:text-slate-900 transition py-6">
                <HugeiconsIcon icon={House02FreeIcons} size={18} />
                <span className="flex items-center gap-1">
                  Properties
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={`transition-transform duration-200 ${propertiesHovered ? "rotate-180" : ""}`} />
                </span>
              </Link>

              <AnimatePresence>
                {propertiesHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[70px] left-1/2 -translate-x-1/2 w-64 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden flex flex-col divide-y z-50"
                  >
                    <Link href="/properties?type=house" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={House03Icon} size={18} className="text-slate-400" /> House
                    </Link>
                    <Link href="/properties?type=apartment" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={Building05Icon} size={18} className="text-slate-400" /> Apartment
                    </Link>
                    <Link href="/properties?type=land" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={Map} size={18} className="text-slate-400" /> Land
                    </Link>
                    <Link href="/properties?type=commercial" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={Store01Icon} size={18} className="text-slate-400" /> Commercial Property
                    </Link>
                    <Link href="/properties?type=office" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={OfficeChairIcon} size={18} className="text-slate-400" /> Office Spaces
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Explore Dropdown */}
            <div
              className="relative flex items-center h-full"
              onMouseEnter={() => setExploreHovered(true)}
              onMouseLeave={() => setExploreHovered(false)}
            >
              <Link href="/explore" className="text-slate-600 flex items-center gap-1.5 justify-center hover:text-slate-900 transition py-6">
                <HugeiconsIcon icon={GlobalSearchIcon} size={18} />
                <span className="flex items-center gap-1">
                  Explore
                  <HugeiconsIcon icon={ArrowDown01Icon} size={14} className={`transition-transform duration-200 ${exploreHovered ? "rotate-180" : ""}`} />
                </span>
              </Link>

              <AnimatePresence>
                {exploreHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-[70px] left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden flex flex-col divide-y z-50"
                  >
                    <Link href="/explore?status=rent" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={Key02Icon} size={18} className="text-slate-400" /> For Rent
                    </Link>
                    <Link href="/explore?status=sale" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={BitcoinTagIcon} size={18} className="text-slate-400" /> For Sale
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/about" className="text-slate-600 flex items-center gap-1.5 justify-center hover:text-slate-900 transition">
              <HugeiconsIcon icon={UserGroupIcon} size={18} /> About
            </Link>
          </nav>

          {/* 3. Desktop Navigation & Actions (Right) */}
          <div className="hidden md:flex items-center gap-4 z-50 shrink-0 relative" ref={profileRef}>
            {isLoggedIn ? (
              <>
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 border pr-6 border-slate-200 rounded-full p-1.5 transition-all bg-white focus:outline-none hover:shadow-xs relative"
                >
                  <div className="relative">
                    {user.profilePicture ? (
                      <div className="relative size-8 rounded-full overflow-hidden border border-slate-200">
                        <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="bg-slate-100 p-1 rounded-full text-slate-600">
                        <HugeiconsIcon icon={UserCircleIcon} size={24} />
                      </div>
                    )}
                    {/* MASTER AVATAR INDICATOR */}
                    {hasAnyPendingAction && (
                      <span className="absolute top-0 right-0 size-2.5 bg-red-500 rounded-full border-2 border-white ring-1 ring-red-200 shadow-sm" />
                    )}
                  </div>

                  <div className="flex flex-col ">
                    <div className="text-left text-[12px] font-medium text-slate-900">{user.name}</div>
                    <div className="text-[10px] text-slate-500">{user.email}</div>
                  </div>
                </button>

                {/* Quick-Action Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-14 w-64 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden flex flex-col py-2"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                        <div className="relative size-10 rounded-full overflow-hidden border border-slate-200 shrink-0">
                          {user.profilePicture ? (
                            <Image src={user.profilePicture} alt="Profile" fill className="object-cover" />
                          ) : (
                            <div className="bg-slate-100 w-full h-full flex items-center justify-center text-slate-600">
                              <HugeiconsIcon icon={UserCircleIcon} size={24} />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                          <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="py-2 border-b border-slate-100">
                        
                        {/* SIGNATURE INDICATOR */}
                        <Link href="/user/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={DashboardSquare01Icon} size={18} className="text-slate-400" /> My Dashboard
                          </div>
                          {user.indicators.signaturePending && (
                            <span className="size-2 bg-red-500 rounded-full animate-pulse shadow-sm" />
                          )}
                        </Link>
                        
                        {/* NEW SAVED PROPERTY INDICATOR */}
                        <Link href="/user/saved" onClick={() => setProfileOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={FavouriteIcon} size={18} className="text-slate-400" /> My Saved Homes
                          </div>
                          {user.indicators.newSaved && (
                            <span className="size-2 bg-blue-500 rounded-full shadow-sm" />
                          )}
                        </Link>
                        
                        {/* KYC INDICATOR */}
                        <Link href="/user/leases" onClick={() => setProfileOpen(false)} className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={File01Icon} size={18} className="text-slate-400" /> Verify Identity
                          </div>
                          {user.indicators.kycPending && (
                            <span className="size-2 bg-red-500 rounded-full animate-pulse shadow-sm" />
                          )}
                        </Link>
                        
                        <Link href="/user/transactions" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <HugeiconsIcon icon={CreditCardPosIcon} size={18} className="text-slate-400" /> Payment History
                        </Link>
                      </div>

                      <div className="py-2 border-b border-slate-100">
                        <Link href="/user/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <HugeiconsIcon icon={Settings01Icon} size={18} className="text-slate-400" /> Account Settings
                        </Link>
                        <Link href="/user/maintenance" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                          <HugeiconsIcon icon={CustomerSupportIcon} size={18} className="text-slate-400" /> Help & Support
                        </Link>
                      </div>

                      <div className="py-1">
                        <form action={logoutAction} className="w-full">
                          <LogoutButton />
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <LoginModal>
                <Button className="bg-black rounded-sm hover:bg-zinc-800 text-white py-3 px-4 font-medium">
                  <Link href="/login" className="flex items-center gap-2">
                    Sign In <HugeiconsIcon icon={ArrowRight01Icon} />
                  </Link>
                </Button>
              </LoginModal>
            )}
          </div>

          {/* 4. Mobile Controls */}
          <div className="flex items-center gap-3 md:hidden z-50">
            {/* Master indicator for mobile avatar */}
            {isLoggedIn && hasAnyPendingAction && (
              <div className="size-2.5 bg-red-500 rounded-full border-2 border-white absolute right-14 top-8 z-10 pointer-events-none shadow-sm" />
            )}
            
            

            <motion.button onClick={toggleMenu} whileTap={{ scale: 0.9 }} className="text-slate-800 focus:outline-none p-2 bg-slate-100 rounded-full">
              {menuOpen ? <HugeiconsIcon icon={Cancel01Icon} size={20} /> : <HugeiconsIcon icon={Menu01Icon} size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 5. Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white border-t border-slate-100 shadow-xl overflow-hidden absolute w-full top-20 left-0"
          >
            <div className="flex flex-col px-6 py-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
              {isLoggedIn && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    {user.profilePicture ? (
                      <div className="relative size-14 rounded-full overflow-hidden border border-slate-200 shrink-0">
                        <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="bg-slate-100 p-2 rounded-full text-slate-600 shrink-0">
                        <HugeiconsIcon icon={UserCircleIcon} size={32} />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-slate-800 text-lg truncate">{user.name}</p>
                    <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Main Site Links */}
              <nav className="flex flex-col gap-4 mb-6 pb-6 border-b border-slate-100">
                <Link href="/" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                  <HugeiconsIcon icon={Home09Icon} size={20} /> Home
                </Link>
                <div className="flex flex-col gap-3">
                  <Link href="/properties" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                    <HugeiconsIcon icon={House02FreeIcons} size={20} /> Properties
                  </Link>
                </div>
                <div className="flex flex-col gap-3 mt-2">
                  <Link href="/explore" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                    <HugeiconsIcon icon={GlobalSearchIcon} size={20} /> Explore
                  </Link>
                </div>
              </nav>

              {/* Conditional Mobile Auth Links */}
              {isLoggedIn ? (
                <>
                  <nav className="flex flex-col gap-4 mb-6 pb-6 border-b border-slate-100">
                    
                    {/* Dashboard (Signature Pending) */}
                    <Link href="/user/dashboard" onClick={toggleMenu} className="flex items-center justify-between text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <span className="flex items-center gap-3">
                        <HugeiconsIcon icon={DashboardSquare01Icon} size={20} /> My Dashboard
                      </span>
                      {user.indicators.signaturePending && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Sign Lease</span>
                      )}
                    </Link>

                    {/* Saved Properties */}
                    <Link href="/user/saved" onClick={toggleMenu} className="flex items-center justify-between text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <span className="flex items-center gap-3">
                        <HugeiconsIcon icon={FavouriteIcon} size={20} /> My Saved Homes
                      </span>
                      {user.indicators.newSaved && (
                        <span className="size-2 bg-blue-500 rounded-full" />
                      )}
                    </Link>

                    {/* Leases (KYC Pending) */}
                    <Link href="/user/leases" onClick={toggleMenu} className="flex items-center justify-between text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <span className="flex items-center gap-3">
                        <HugeiconsIcon icon={File01Icon} size={20} /> KYC & Bookings
                      </span>
                      {user.indicators.kycPending && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Verify ID</span>
                      )}
                    </Link>
                    
                    <Link href="/user/transactions" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={CreditCardPosIcon} size={20} /> Payment History
                    </Link>
                  </nav>

                  <nav className="flex flex-col gap-4">
                    <Link href="/user/settings" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={Settings01Icon} size={20} /> Account Settings
                    </Link>
                    <Link href="/user/maintenance" onClick={toggleMenu} className="flex items-center gap-3 text-lg font-medium text-slate-700 hover:text-slate-900 transition">
                      <HugeiconsIcon icon={CustomerSupportIcon} size={20} /> Help & Support
                    </Link>
                    <form action={logoutAction} className="w-full mt-2" onSubmit={toggleMenu}>
                      <LogoutButton />
                    </form>
                  </nav>
                </>
              ) : (
                <div className="pt-2">
                  <LoginModal>
                    <Button className="w-full h-12 text-lg font-medium bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl">
                      Sign In
                    </Button>
                  </LoginModal>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}