import { applyZodInitialConfig } from "@/utils/zod";
import { z } from "zod";

applyZodInitialConfig();

export class BoardSchemas {
    static criar = z.object({
        nome: z.string().min(1).max(100).trim(),
        usuarios: z.object({
            _id: z.string()
          }).array().min(1).transform((value) => value.map((item) => item._id))
    });
}