import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Link from "next/link";
import {
  LuTriangleAlert,
  LuFolder,
  LuGlobe,
  LuImage,
  LuRocket,
  LuShoppingBag,
} from "react-icons/lu";

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
      title: "Products",
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
    {
      href: "/main/jobs",
      icon: <LuRocket />,
      title: "Jobs",
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className='space-y-4 py-6'>
        <div className='px-3 pb-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
            Manage
          </h2>
          <div className='space-y-1'>
            {generalItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className='w-full justify-start gap-2'
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
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
            Publish
          </h2>
          <div className='space-y-1'>
            {publishItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className='w-full justify-start gap-2'
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
        <div className='px-3 py-2'>
          <h2 className='mb-2 px-4 text-lg font-semibold tracking-tight'>
            Analyze
          </h2>
          <div className='space-y-1'>
            <Button variant='ghost' className='w-full justify-start gap-2'>
              <LuTriangleAlert />
              Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
