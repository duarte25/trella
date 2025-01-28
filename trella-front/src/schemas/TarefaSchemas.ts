import { applyZodInitialConfig } from "@/utils/zod";
import { z } from "zod";

applyZodInitialConfig();

// Função de validação personalizada para o campo responsavel, tive um bug que não consegui resolver, o _id estão vindo como string e não tem type de object id enfim com o zod resolvo
const isValidObjectId = (value: string) => /^[a-fA-F0-9]{24}$/.test(value);

export class TarefaSchemas {
    static criar = z.object({
        titulo: z.string().min(3).max(200).trim(),
        descricao: z.string().min(1).max(554).trim(),
        responsavel: z.string()
            .refine(isValidObjectId, {
                message: "O responsável deve ser um ObjectId válido.",
            }),
        data_inicial: z.date(),
        data_final: z.date(),
    });
}