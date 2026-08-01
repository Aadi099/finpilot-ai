"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSupabaseUser,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

export function AuthChip() {
  const [email, setEmail] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    getSupabaseUser().then((user) => {
      if (mounted) {
        setEmail(user?.email ?? null);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const label = email ?? (configured ? "Sign in" : "Setup login");
  const initials = email ? email.slice(0, 2).toUpperCase() : "AD";

  return (
    <Link className="user-chip" href="/sign-in">
      <span>{initials}</span>
      <div>
        <strong>{label}</strong>
        <small>{email ? "Google workspace" : configured ? "Not signed in" : "Local mode"}</small>
      </div>
    </Link>
  );
}
