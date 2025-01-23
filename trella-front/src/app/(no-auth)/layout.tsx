import { getCookie } from "@/actions/handleCookie";
import { redirect } from "next/navigation";

export default async function LayoutNoAuth({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getCookie("accessToken");

  if (token) {
    redirect("/home");
  }

  return <>{children}</>;
}
