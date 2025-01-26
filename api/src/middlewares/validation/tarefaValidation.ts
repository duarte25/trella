import Tarefas, { StatusTarefas } from "../../models/Tarefas";
import { Validator, ValidationFuncs as v } from "./validation";
import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/mensagens";
import Usuario from "../../models/Usuario";
import Board from "../../models/Board";

export default class TarefaValidation {

    static async CriarTarefaValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const val = new Validator(req.body);
        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        await val.validate("titulo", v.required(), v.trim(), v.validateLength({ max: 200 }));
        await val.validate("descricao", v.optional(), v.trim(), v.validateLength({ max: 554 }));

        // Usando o enum StatusTarefas para validar o campo "status"
        await val.validate("status", v.required(), v.enum({ values: Object.values(StatusTarefas) }));

        await val.validate("responsavel", v.required(), v.mongooseID(), v.exists({
            model: Usuario,
            query: { _id: req.body.responsavel }
        }));

        await val.validate("board_id", v.required(), v.mongooseID(), v.exists({
            model: Board,
            query: { _id: req.body.board_id }
        }));

        await val.validate("data_inicial", v.required(), v.toUTCDate());
        await val.validate("data_final", v.required(), v.toUTCDate());

        if (val.anyErrors()) return sendError(res, 422, val.getErrors());
        req.body = val.getSanitizedBody();

        return next();
    }

    static async AlterarTarefaValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        let val = new Validator(req.params);

        // Validar id
        await val.validate("id",
            v.required(),
            v.mongooseID(),
            v.toMongooseObj({ model: Tarefas, query: { _id: req.params.id } })
        );

        // Erro 404 quando id não existe
        if (val.anyErrors()) return sendError(res, 404, val.getErrors());

        const tarefa = val.getValue("id");

        const tokenDecoded = req.decodedToken;
        const userId = tokenDecoded?.id;

        val = new Validator(req.body);

        await val.validate("titulo", v.optional(), v.trim(), v.validateLength({ max: 200 }));
        await val.validate("descricao", v.optional(), v.trim(), v.validateLength({ max: 554 }));

        await val.validate("status", v.required(), v.enum({ values: Object.values(StatusTarefas) }));

        await val.validate("responsavel", v.optional(), v.mongooseID(), v.exists({
            model: Usuario,
            query: { _id: req.body.responsavel }
        }));

        await val.validate("board_id", v.optional(), v.mongooseID(), v.exists({
            model: Board,
            query: { _id: req.body.board_id }
        }));

        await val.validate("data_inicial", v.optional(), v.toUTCDate());
        await val.validate("data_final", v.optional(), v.toUTCDate());


        if (val.anyErrors()) return sendError(res, 422, val.getErrors());

        req.body = val.getSanitizedBody();

        req.validateResult = {
            tarefa: tarefa
        };

        return next();
    }
}