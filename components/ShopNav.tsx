"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export type ShopNavProps = React.HTMLAttributes<HTMLElement> & {
  show?: string[];
};

export function ShopNav({
  className,
  show = ["overview", "collections", "products", "settings"],
  ...props
}: ShopNavProps) {
  const pathname = usePathname();
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href='./overview'
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          (!pathname.includes("overview") || !pathname.includes("shops")) &&
            "text-muted-foreground"
        )}
      >
        Overview
      </Link>
      <Link
        href='./collections'
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          (!pathname.includes("collections") || !pathname.includes("shops")) &&
            "text-muted-foreground"
        )}
      >
        Collections
      </Link>
      <Link
        href='./products'
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          (!pathname.includes("products") || !pathname.includes("shops")) &&
            "text-muted-foreground"
        )}
      >
        Products
      </Link>
      <Link
        href='./settings'
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          (!pathname.includes("settings") || !pathname.includes("shops")) &&
            "text-muted-foreground"
        )}
      >
        Settings
      </Link>
    </nav>
  );
}
