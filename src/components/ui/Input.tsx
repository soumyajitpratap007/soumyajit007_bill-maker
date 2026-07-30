"use client";
import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftAdornment, rightAdornment, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-ink-700 dark:text-ink-200">
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border bg-white dark:bg-ink-900 dark:border-ink-700",
            "border-ink-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15",
            "transition-shadow px-3 h-10",
            error && "border-red-500 focus-within:ring-red-500/15",
          )}
        >
          {leftAdornment ? <span className="text-ink-400">{leftAdornment}</span> : null}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full bg-transparent outline-none text-sm placeholder:text-ink-400",
              "text-ink-900 dark:text-ink-50",
              className,
            )}
            {...props}
          />
          {rightAdornment ? <span className="text-ink-400">{rightAdornment}</span> : null}
        </div>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
