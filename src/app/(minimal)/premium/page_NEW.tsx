"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/LoadingOverlay";

export default function PremiumRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return <LoadingOverlay message="MENGALIHKAN..." />;
}