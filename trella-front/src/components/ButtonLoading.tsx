import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ButtonLoadingProps {
  isLoading: boolean;
  children?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: string;
  [key: string]: unknown; // Permite props adicionais
}

export default function ButtonLoading({
  isLoading,
  children,
  className,
  type = "submit",
  size = "lg",
  ...props
}: ButtonLoadingProps) {
  return (
    <Button
      disabled={isLoading}
      className={cn("w-32", className)}
      type={type}
      size={size}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {!isLoading && children}
    </Button>
  );
}
