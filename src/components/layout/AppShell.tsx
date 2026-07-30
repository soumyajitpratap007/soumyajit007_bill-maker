"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/cn";
import { ILogo, IReceipt, IUser, IBriefcase, IFile, IPlus, IMenu, IX } from "@/components/ui/Icon";
import { ToastProvider } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: <ILogo /> },
  { href: "/bills", label: "Bills", icon: <IReceipt /> },
  { href: "/clients", label: "Clients", icon: <IUser /> },
  { href: "/products", label: "Products", icon: <IFile /> },
  { href: "/business", label: "My Business", icon: <IBriefcase /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => { setMobileOpen(false); }, [pathname]);
  return (
    <ToastProvider>
      <div className="min-h-screen bg-ink-50/60 dark:bg-ink-950 flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-950">
          <Link href="/" className="h-14 flex items-center gap-2 px-5 border-b border-ink-100 dark:border-ink-800 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><ILogo/></span>
            Bill Maker
          </Link>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 h-10 rounded-xl text-sm font-medium",
                    active
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                      : "text-ink-600 hover:text-ink-900 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-900",
                  )}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-3">
            <Link href="/bills/new"><Button className="w-full"><IPlus width={16} height={16}/> Create bill</Button></Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 sticky top-0 z-30 flex items-center gap-2 px-4 sm:px-6 border-b border-ink-100 dark:border-ink-800 bg-white/90 dark:bg-ink-950/90 backdrop-blur">
            <button className="lg:hidden -ml-2 h-10 w-10 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <IMenu />
            </button>
            <div className="text-sm font-medium text-ink-700 dark:text-ink-200">{titleFor(pathname)}</div>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/bills/new"><Button size="sm"><IPlus width={16} height={16}/> New</Button></Link>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
          {/* Mobile bottom nav */}
          <nav className="lg:hidden sticky bottom-0 z-30 border-t border-ink-100 dark:border-ink-800 bg-white/95 dark:bg-ink-950/95 backdrop-blur">
            <div className="grid grid-cols-5">
              {NAV.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href} className={cn(
                    "flex flex-col items-center justify-center py-2 text-[11px]",
                    active ? "text-brand-600" : "text-ink-500",
                  )}>
                    {item.icon}
                    <span className="mt-0.5">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-ink-950 border-r border-ink-100 dark:border-ink-800 p-3 animate-fade-in">
              <div className="h-14 flex items-center justify-between px-2">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white"><ILogo/></span>
                  Bill Maker
                </div>
                <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800" onClick={() => setMobileOpen(false)}><IX/></button>
              </div>
              <div className="mt-2 space-y-1">
                {NAV.map((item) => (
                  <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800">
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </ToastProvider>
  );
}

function titleFor(pathname: string): string {
  if (pathname.startsWith("/bills/new")) return "Create bill";
  if (pathname.startsWith("/bills/")) return "Bill";
  if (pathname.startsWith("/bills")) return "Bills";
  if (pathname.startsWith("/clients")) return "Clients";
  if (pathname.startsWith("/products")) return "Products";
  if (pathname.startsWith("/business")) return "My Business";
  return "Dashboard";
}
