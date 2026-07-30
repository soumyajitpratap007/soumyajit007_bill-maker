"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ILogo } from "@/components/ui/Icon";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Auth isn't configured yet. Add Supabase keys to .env.local — or use the app locally without signup.");
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowser();
    if (!supabase) return setLoading(false);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-ink-950 dark:via-ink-950 dark:to-ink-900 p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 font-semibold mb-6 justify-center">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><ILogo/></span>
          Bill Maker
        </Link>
        <Card>
          <CardBody className="p-6 sm:p-8">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-ink-500 mt-1">Sync bills across your phone, laptop and shop.</p>

            {sent ? (
              <div className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 text-sm">
                Check your email for a confirmation link. Then come back and sign in.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
                <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Password" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <Button type="submit" loading={loading}>Create account</Button>
                <Button type="button" variant="outline" onClick={() => router.push("/bills/new")}>
                  Skip — try it without signup
                </Button>
              </form>
            )}
            <p className="mt-6 text-sm text-ink-500 text-center">
              Already have an account? <Link href="/login" className="text-brand-600 font-medium">Sign in</Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
