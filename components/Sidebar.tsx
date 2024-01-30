import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import {
  CiFolderOn,
  CiImageOn,
  CiBag1,
  CiWarning,
  CiShop,
} from "react-icons/ci";
import Image from "next/image";
import classNames from "classnames";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import { ImageIcon } from "@radix-ui/react-icons";
import { LuAlertTriangle, LuFolder, LuGlobe, LuImage, LuShoppingBag } from "react-icons/lu";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const generalItems: {
    title: string;
    icon: ReactNode;
    onClick?: () => void;
    href: string;
    description?: string;
  }[] = [
    {
      href: "/main/products",
      icon: <LuShoppingBag />,
      title: "Product",
    },
    {
      href: "/main/images",
      icon: <LuImage />,
      title: "Images",
    },
    {
      href: "/main/collections",
      icon: <LuFolder />,
      title: "Collections",
    },
  ];

  const publishItems: {
    title: string;
    icon: ReactNode;
    onClick?: () => void;
    href: string;
    description?: string;
  }[] = [
    {
      href: "/main/shops",
      icon: <LuGlobe />,
      title: "Shops",
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="flex items-center px-3">
        <Image
          width={50}
          height={50}
          src="/logo.png"
          alt="logo"
          priority
          style={{ minWidth: 50 }}
        />
        <span className={classNames("logo__text")}>Shopibox</span>
      </div>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            General
          </h2>
          <div className="space-y-1">
            {generalItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Publish
          </h2>
          <div className="space-y-1">
            {publishItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Analysis
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LuAlertTriangle />
              Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
