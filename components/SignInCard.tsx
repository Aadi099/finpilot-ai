"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getSupabaseBrowserClient,
  getSupabaseUser,
  isSupabaseConfigured,
} from "@/lib/supabase-client";

export function SignInCard() {
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

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signInWithOAuth({
      options: {
        redirectTo: window.location.origin,
      },
      provider: "google",
    });
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setEmail(null);
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="brand" aria-label="Back to FinPilot AI">
          <span>FP</span>
          <strong>FinPilot AI</strong>
        </Link>
        <div>
          <p className="eyebrow">Secure workspace</p>
          <h1>{email ? "You are signed in" : "Sign in to your finance workspace"}</h1>
          <p>
            Google login stores your accounts and transactions against your
            Supabase user ID with row-level security.
          </p>
        </div>

        {configured ? (
          email ? (
            <>
              <div className="setup-box">
                <strong>{email}</strong>
                <span>Your database-backed workspace is active.</span>
              </div>
              <button className="ghost-button full" onClick={signOut} type="button">
                Sign out
              </button>
            </>
          ) : (
            <button className="primary-button full" onClick={signInWithGoogle} type="button">
              Continue with Google
            </button>
          )
        ) : (
          <div className="setup-box">
            <strong>Supabase setup needed</strong>
            <span>
              Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in
              Cloudflare to enable Google login.
            </span>
          </div>
        )}
      </section>
    </main>
  );
}
