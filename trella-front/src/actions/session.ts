"use server";

import { cookies } from "next/headers";

export async function createSession(token: string) {
  const cookieStore = await cookies();

  const expiresIn = 60 * 60 * 24 * 7;

  cookieStore.set("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: expiresIn
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
}
