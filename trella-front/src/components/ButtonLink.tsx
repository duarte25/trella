"use client";

import { Button, buttonVariants } from "./ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ButtonLinkProps {
  href?: string;
  children: ReactNode;
  showIcon?: boolean;
  sessionStorageKey?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined; 
  size?: "default" | "sm" | "lg" | "icon" | null | undefined; 
  [key: string]: unknown;
}

export default function ButtonLink({
  href,
  children,
  showIcon = false,
  sessionStorageKey,
  className,
  variant = "default",
  size = "default", 
  ...props
}: ButtonLinkProps) {
  const router = useRouter();
  
  if (href) {
    let session: string | null = null;
    let urlSessionStorage: string | null = null;
    
    if (typeof window !== "undefined") {
      session = sessionStorage.getItem(sessionStorageKey || "");
    }
    
    if (session) {
      if (session.charAt(0) !== "/") {
        const lastSlashIndex = href.lastIndexOf("/");
        const beforeLastSlash = href.slice(0, lastSlashIndex);
        urlSessionStorage = `${beforeLastSlash}/${session}`;
      } else {
        urlSessionStorage = session;
      }
    }

    return (
      <Link
        href={urlSessionStorage ? urlSessionStorage : href}
        className={cn(buttonVariants({ variant, size }), className, "flex gap-1")} // Correção na chamada da função cn
        {...props}
        replace={true}
      >
        {showIcon && <ArrowLeft className="w-4 h-4" />}
        {children}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => router.back()}
      size={size}
      className={cn("flex gap-1", className)} // Correção na chamada da função cn
      {...props}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      {children}
    </Button>
  );
}