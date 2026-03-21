import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "glass-card p-6 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: any) => {
  const variants = {
    primary: "bg-violet-600 text-white hover:bg-violet-500 shadow-xl shadow-violet-500/20",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/5",
    outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={cn(
        "rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center tracking-tight",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
