import Link from "next/link";
import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950">
      <Container className="py-10 text-sm text-ink-500 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-ink-900 dark:text-ink-50">Bill Maker</div>
          <div>Built for Indian businesses. GST-ready. Free forever.</div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/#features">Features</Link>
          <Link href="/#templates">Templates</Link>
          <Link href="/bills/new">Create bill</Link>
          <Link href="/login">Sign in</Link>
        </div>
        <div>© {new Date().getFullYear()} Bill Maker</div>
      </Container>
    </footer>
  );
}
