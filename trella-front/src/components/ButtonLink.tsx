"use client";

import { Button, buttonVariants } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonLinkProps {
  href?: string;
  children: ReactNode;
  showIcon?: boolean;
  sessionStorageKey?: string;
  className?: string;
  variant?: string;
  size?: string;
  [key: string]: any;
}

export default function ButtonLink({
  href,
  children,
  showIcon = false,
  sessionStorageKey,
  className,
  variant = "",
  size = "",
  ...props
}: ButtonLinkProps) {
  const router = useRouter();

  if (href) {
    // Pegar as querys que estão no sessionStorage
    let session: string | null = null;
    let urlSessionStorage: string | null = null;

    if (typeof window !== "undefined") {
      session = sessionStorage.getItem(sessionStorageKey || "");
    }

    if (session) {
      // Processo para desmontar o href para adicionar o link com as querys
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
        className={cn(buttonVariants({ variant, size }, className), "flex gap-1", className)}
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
      className={cn("flex gap-1", className)}
      {...props}
    >
      {showIcon && <ArrowLeft className="w-4 h-4" />}
      {children}
    </Button>
  );
}
