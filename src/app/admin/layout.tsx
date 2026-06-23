import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { connectToDatabase } from "@/config/DbConnect";
import { getSession, SessionPayload } from "@/lib/session";
import { cn } from "@/lib/utils";
import User from "@/models/user";
import { Figtree, Geist, Geist_Mono } from "next/font/google";
import '../globals.css';
import { Toaster } from "@/components/ui/sonner";
const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession() as SessionPayload
  
  await connectToDatabase();
  const dbUser = await User.findById(session.userId).lean();

  

  // 3. Map it to the exact shape the Sidebar expects
  const freshUser = {
    name: dbUser.name,
    email: dbUser.email,
    avatar: dbUser.profilePicture || "/default-avatar.png", // Fallback if they haven't uploaded one
  };
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable)}
    >
      <body>
      <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={freshUser} variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {children}
              </div>
              <Toaster position="top-right"/>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
      </body>
    </html>
  )
}
