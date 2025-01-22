"use server";

import { cookies } from "next/headers";

export async function getCookie(cookie: string) {
  const cookieStore = await cookies();

  return cookieStore.get(cookie);
}
