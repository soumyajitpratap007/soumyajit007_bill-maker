"use client";
import * as React from "react";

type Toast = { id: number; message: string; tone?: "info" | "success" | "error" };
const Ctx = React.createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[60] bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 items-center pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto animate-fade-in rounded-xl px-4 py-2.5 text-sm shadow-card border max-w-sm " +
              (t.tone === "success"
                ? "bg-emerald-600 text-white border-emerald-500"
                : t.tone === "error"
                ? "bg-red-600 text-white border-red-500"
                : "bg-ink-900 text-white border-ink-800")
            }
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
