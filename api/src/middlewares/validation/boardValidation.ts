import { Validator, ValidationFuncs as v } from "./validation";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/mensagens";
import Usuario from "../../models/Usuario";
import Board from "../../models/Board";

export default class BoardValidation {

    static async listarIDBoardValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        let val = new Validator(req.params);

        await val.validate("id",
            v.required(),
            v.mongooseID(),
            v.toMongooseObj({ model: Board, query: { _id: req.params.id } })
        );

        if (val.anyErrors()) return sendError(res, 404, val.getErrors());

        const board = val.getValue("id");

        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        if (userId !== board.responsavel && !board.usuarios.includes(userId)) {
            return sendError(res, 403, "Sem permissão para acessar.");
        }

        req.body = val.getSanitizedBody();

        req.validateResult = {
            board: board
        };

        return next();
    }

    static async CriarBoardValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const val = new Validator(req.body);
        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        await val.validate("nome", v.required(), v.trim(), v.validateLength({ max: 50 }));
        await val.validate("usuarios", v.optional(),)

        if (val.body.usuarios) {
            for (const usuario of val.body.usuarios) {
                await val.validate("usuarios", v.mongooseID({ valorMongo: usuario }), v.exists({ model: Usuario, query: { _id: usuario } }));
            }
        }

        if (val.anyErrors()) return sendError(res, 422, val.getErrors());
        req.body = val.getSanitizedBody();

        req.body.responsavel = userId;

        return next();
    }

    static async AlterarBoardValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        let val = new Validator(req.params);

        // Validar id
        await val.validate("id",
            v.required(),
            v.mongooseID(),
            v.toMongooseObj({ model: Board, query: { _id: req.params.id } })
        );

        // Erro 404 quando id não existe
        if (val.anyErrors()) return sendError(res, 404, val.getErrors());

        const board = val.getValue("id");

        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        if (userId !== board.responsavel) {
            return sendError(res, 403, "Sem permissão para editar essa board.");
        }

        val = new Validator(req.body);

        await val.validate("nome", v.optional(), v.trim(), v.validateLength({ max: 50 }));
        await val.validate("usuarios", v.optional())

        if (req.body.usuarios) {
            for (const usuario of val.body.usuarios) {
                await val.validate("usuarios", v.mongooseID({ valorMongo: usuario }), v.exists({ model: Usuario, query: { _id: usuario } }));
            }
        }

        if (val.anyErrors()) return sendError(res, 422, val.getErrors());

        req.body = val.getSanitizedBody();

        req.validateResult = {
            board: board
        };

        return next();
    }

    static async deleteBoardValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        let val = new Validator(req.params);

        await val.validate("id",
            v.required(),
            v.mongooseID(),
            v.toMongooseObj({ model: Board, query: { _id: req.params.id } })
        );

        if (val.anyErrors()) return sendError(res, 404, val.getErrors());

        const board = val.getValue("id");

        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        if (userId !== board.responsavel) {
            return sendError(res, 403, "Sem permissão para deletar essa board.");
        }

        return next();
    }
}