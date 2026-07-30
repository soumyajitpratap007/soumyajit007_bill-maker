"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-ink-700 dark:text-ink-200">
            {label}
          </label>
        ) : null}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "h-10 rounded-xl border border-ink-200 bg-white dark:bg-ink-900 dark:border-ink-700",
            "px-3 text-sm text-ink-900 dark:text-ink-50 outline-none",
            "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-shadow",
            error && "border-red-500 focus:ring-red-500/15",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="text-xs text-red-600">{error}</p> : hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      </div>
    );
  },
);
Select.displayName = "Select";
