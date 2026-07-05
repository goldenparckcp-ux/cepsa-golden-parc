"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on admin and staff pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/staff")) {
    return null;
  }

  return <Footer />;
}
