"use server";

import { cookies } from "next/headers";

export async function getCookie(cookie: string) {
  const cookieStore = await cookies();

  return cookieStore.get(cookie);
}

// Deleta um cookie pelo nome
export async function deleteCookie(cookieName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName); // Chama delete diretamente
}