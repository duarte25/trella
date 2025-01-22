import { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface Props extends ComponentProps<typeof Button> {
  isLoading: boolean;
}

export default function ButtonLoading({
  isLoading,
  children,
  className,
  type = "submit",
  size = "lg",
  ...props
}: Props) {
  return (
    <Button disabled={isLoading} className={cn("w-32", className)} type={type} size={size} {...props}>
      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {!isLoading && children}
    </Button>
  );
}
