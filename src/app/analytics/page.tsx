"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to insights page
    router.push("/insights");
  }, [router]);

  return null;
}
