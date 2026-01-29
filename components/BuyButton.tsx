"use client";

import clsx from "clsx";
import Link from "next/link";

export type BuyButtonVariant = "primary" | "secondary" | "ghost";

type BuyButtonProps = {
  href: string;
  label?: string;
  variant?: BuyButtonVariant;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  className?: string;
  newTab?: boolean;
};

export default function BuyButton({
  href,
  label = "Buy now",
  variant = "primary",
  fullWidth = false,
  icon,
  className,
  newTab = true,
}: BuyButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const styles: Record<BuyButtonVariant, string> = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white/90",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700",
    ghost:
      "bg-transparent text-slate-900 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-100 dark:hover:bg-slate-800",
  };

  const targetProps = newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Link
      href={href}
      className={clsx(base, styles[variant], fullWidth && "w-full", className)}
      {...targetProps}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
