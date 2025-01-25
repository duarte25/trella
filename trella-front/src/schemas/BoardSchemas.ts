import { applyZodInitialConfig } from "@/utils/zod";
import { z } from "zod";

applyZodInitialConfig();

export class BoardSchemas {
    static criar = z.object({
        nome: z.string().min(1).max(100).trim(),
        usuarios: z.array(z.string()).min(1) // Aceita um array de strings (IDs)
    });

    static filtrarBoards = z.object({
        nome: z.string().min(1).max(100).trim()
    })
}