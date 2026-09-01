import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "takeboost" | "outline" | "solid";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-panel border-[1.5px] border-panel-line text-purple-deep",
    takeboost: "bg-mint border-2 border-ink text-ink shadow-sticker",
    outline: "border-2 border-ink text-ink",
    solid: "bg-ink text-white",
  };

  return (
    <span
      className={cn("inline-flex items-center px-4 py-2 rounded-full text-[13px] font-bold", variants[variant], className)}
      {...props}
    />
  );
}

