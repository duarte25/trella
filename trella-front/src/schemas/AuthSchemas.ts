import { applyZodInitialConfig } from "@/utils/zod";
import { z } from "zod";

applyZodInitialConfig();

export class AuthSchemas {
  static login = z.object({
    email: z.string().min(1).email("Email inválido").max(256),
    senha: z.string().min(8).max(256),
  });

  static register = z.object({
    nome: z.string().min(1).max(256),
    cpf: z.string().min(11).max(11),
    email: z.string().min(1).email("Email inválido").max(256),
    senha: z.string().min(8).max(256),
  });
}
