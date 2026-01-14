"use client";

import { useEffect, useState } from "react";

export default function DebugEnv() {
  const [envStatus, setEnvStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for variables available in the browser (must be prefixed with NEXT_PUBLIC_)
    const status = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✅ Loaded"
        : "❌ Undefined",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "✅ Loaded (Masked)"
        : "❌ Undefined",
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        ? "✅ Loaded"
        : "❌ Undefined",
      // Non-public variables should NOT be available here
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "⚠️ LEAKED (Should be undefined)"
        : "✅ Safe (Undefined)",
    };
    setEnvStatus(status);
  }, []);

  return (
    <div className="p-10 font-mono text-sm">
      <h1 className="text-2xl font-bold mb-6">Environment Variable Debugger</h1>
      <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
        <pre>{JSON.stringify(envStatus, null, 2)}</pre>
      </div>
      <p className="mt-4 text-red-600 font-bold">
        IMPORTANT: Delete this page after debugging!
      </p>
    </div>
  );
}
