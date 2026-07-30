import Link from "next/link";
import { Container } from "./Container";
import { ILogo } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-ink-950/70 dark:border-ink-800">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink-900 dark:text-ink-50">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <ILogo />
          </span>
          Bill Maker
          <span className="ml-1 text-[10px] uppercase tracking-wider font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-1.5 py-0.5 rounded">India</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-ink-600 dark:text-ink-300">
          <Link href="/#features" className="hover:text-ink-900 dark:hover:text-white">Features</Link>
          <Link href="/#templates" className="hover:text-ink-900 dark:hover:text-white">Templates</Link>
          <Link href="/#faq" className="hover:text-ink-900 dark:hover:text-white">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/bills/new">
            <Button size="sm">Create bill</Button>
          </Link>
        </div>
      </Container>
    </header>
  );
}
