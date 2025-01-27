import { applyZodInitialConfig } from "@/utils/zod";
import { z } from "zod";

applyZodInitialConfig();

export class TarefaSchemas {
    static criar = z.object({
        titulo: z.string().min(1).max(200).trim(),
        descricao: z.string().min(1).max(554).trim(),
        responsavel: z.string(),
        data_inicial: z.date(),
        data_final: z.date(),
    });
}