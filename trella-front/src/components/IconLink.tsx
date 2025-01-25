"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { buttonVariants } from "./ui/button";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconLinkProps extends LinkProps {
  className?: string;
  setPreviousLink?: boolean;
  children: ReactNode;
}

export default function IconLink({ href, className, setPreviousLink = true, children, ...props }: IconLinkProps) {
  const pathname = usePathname();
  const searchParams = Object.fromEntries(useSearchParams().entries());

  return (
    <Link
      href={href}
      onClick={() => {
        if (setPreviousLink) {
          sessionStorage.setItem("previousLink", `${pathname}?${new URLSearchParams(searchParams).toString()}`);
        }
      }}
      className={cn(buttonVariants({ variant: "ghost" }), "p-2", className)}
      {...props}
    >
      {children}
    </Link>
  );
}