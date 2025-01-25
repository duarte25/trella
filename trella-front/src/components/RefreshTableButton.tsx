"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import actionRevalidateTag from "@/actions/actionRevalidateTag";

// Define the props for the RefreshTableButton component
interface RefreshTableButtonProps {
  tag: string;
}

export default function RefreshTableButton({ tag }: RefreshTableButtonProps) {
  const [loading, setLoading] = useState<boolean>(false);

  // Function to handle the refresh action
  async function refresh() {
    setLoading(true);

    // Simulate a delay for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Revalidate the tag
    actionRevalidateTag(tag);

    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      className="flex items-center gap-2"
      onClick={refresh}
      disabled={loading}
    >
      <RefreshCcw
        className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
      />
    </Button>
  );
}