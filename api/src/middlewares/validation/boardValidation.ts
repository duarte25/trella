import { Validator, ValidationFuncs as v } from "./validation";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/mensagens";
import Usuario from "../../models/Usuario";

export default class BoardValidation {

    static async CriarBoardValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const val = new Validator(req.body);
        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        await val.validate("nome", v.required(), v.trim(), v.validateLength({ max: 50 }));
        await val.validate("usuarios", v.optional(),)

        if (val.body.usuarios) {
            for (const usuario of val.body.usuarios) {
                // Aqui, você passa diretamente o valor do usuario
                await val.validate("usuarios", v.mongooseID({ valorMongo: usuario }), v.exists({ model: Usuario, query: { _id: usuario } }));
            }
        }

        if (val.anyErrors()) return sendError(res, 422, val.getErrors());
        req.body = val.getSanitizedBody();

        req.body.responsavel = userId;

        return next();
    }
}