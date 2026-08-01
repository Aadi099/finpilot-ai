import Link from "next/link";

export function SignInCard() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="brand" aria-label="Back to FinPilot AI">
          <span>FP</span>
          <strong>FinPilot AI</strong>
        </Link>
        <div>
          <p className="eyebrow">Authentication scaffold</p>
          <h1>Sign in to your finance workspace</h1>
          <p>
            Phase 1 keeps auth provider-neutral. The server-side adapter in
            lib/auth.ts can later connect to Clerk, Supabase Auth, or a custom
            OAuth/OTP provider.
          </p>
        </div>
        <button className="primary-button full">Continue with Google</button>
        <button className="ghost-button full">Continue with email OTP</button>
      </section>
    </main>
  );
}
