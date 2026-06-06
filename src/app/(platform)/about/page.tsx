import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";
import {
  Home02FreeIcons,
  LockIcon,
  Money02FreeIcons,
  Smile,
} from "@hugeicons/core-free-icons";
import Navbar from "@/components/navbar";
import { HugeiconsIcon } from "@hugeicons/react";
import Manifesto from "@/components/manifesto";
import TheStandard from "@/components/the-standard";
import ByTheNumbers from "@/components/by-the-numbers";
import TheVoices from "@/components/the-voices";
import TheArchitects from "@/components/the-architecture";
import Cta from "@/components/cta";
import History from "@/components/history";

export default function AboutPage() {
  const values = [
    {
      icon: Home02FreeIcons,
      title: "Comfort You Can Trust",
      description:
        "Every WunkatHomes room is carefully managed and maintained for a clean, safe, and comfortable stay.",
    },
    {
      icon: LockIcon,
      title: "Transparent & Secure",
      description:
        "No hidden fees or surprises. Every booking and payment is handled securely for your peace of mind.",
    },
    {
      icon: Money02FreeIcons,
      title: "Affordable Living",
      description:
        "Enjoy modern, well-kept spaces at prices that make sense. Quality living doesn’t have to be expensive.",
    },
    {
      icon: Smile,
      title: "Simple Experience",
      description:
        "From browsing to booking, every step is designed to be smooth and hassle-free so you can move in with confidence.",
    },
  ];

  return (
    <div className="">
        <Manifesto/>
        <History/>
        <TheArchitects/>
        {/* <TheStandard/> */}
        <TheVoices/>
        <ByTheNumbers/>
        <Cta/>
        
      
    </div>
  );
}
