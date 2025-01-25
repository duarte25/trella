"use server";

import { revalidateTag } from "next/cache";

/**
 * Função para revalidar uma tag no cache do Next.js.
 * @param tag - A tag associada ao cache que será revalidada.
 */
export default async function actionRevalidateTag(tag: string): Promise<void> {
  revalidateTag(tag);
}