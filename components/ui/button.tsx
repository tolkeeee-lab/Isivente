import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "takeboost";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
    
    const variants = {
      primary: "bg-magenta hover:bg-magenta-deep text-white focus-visible:ring-magenta shadow-sm",
      secondary: "bg-panel border-2 border-panel-line text-purple-deep hover:bg-panel-line focus-visible:ring-purple-deep",
      outline: "border-2 border-ink bg-transparent hover:bg-ink hover:text-white text-ink focus-visible:ring-ink",
      ghost: "hover:bg-slate-100 text-ink focus-visible:ring-slate-400",
      danger: "bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500",
      takeboost: "bg-ink text-white hover:bg-magenta hover:-translate-y-0.5 shadow-lg",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-6 py-3 text-sm",
      lg: "px-8 py-4 text-base",
      xl: "px-10 py-5 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

