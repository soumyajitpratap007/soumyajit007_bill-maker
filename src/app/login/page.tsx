"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ILogo } from "@/components/ui/Icon";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Auth isn't configured yet. You can still use the app locally — go straight to Create Bill.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace(next);
  }

  async function onGoogle() {
    if (!isSupabaseConfigured) return setError("Auth not configured.");
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${next}` },
    });
  }

  return (
    <Card>
      <CardBody className="p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-ink-900 dark:text-ink-50">Welcome back</h1>
        <p className="text-sm text-ink-500 mt-1">Sign in to sync your bills across devices.</p>

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 p-3 text-sm">
            Supabase isn&rsquo;t configured yet. You can still use the app fully — bills are saved in your browser.
            <div className="mt-2">
              <Link href="/bills/new"><Button size="sm" variant="secondary">Skip to Create Bill</Button></Link>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" loading={loading}>Sign in</Button>
        </form>

        <div className="mt-4 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-100" /> or <span className="h-px flex-1 bg-ink-100" />
        </div>
        <Button variant="outline" className="mt-4 w-full" onClick={onGoogle}>
          Continue with Google
        </Button>
        <p className="mt-6 text-sm text-ink-500 text-center">
          New here? <Link href="/signup" className="text-brand-600 font-medium">Create account</Link>
        </p>
      </CardBody>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-ink-950 dark:via-ink-950 dark:to-ink-900 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-semibold mb-6 justify-center">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><ILogo/></span>
          Bill Maker
        </Link>
        <Suspense fallback={<div className="text-center text-sm text-ink-500">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
