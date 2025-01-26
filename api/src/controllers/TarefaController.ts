import messages, { sendResponse } from "../utils/mensagens";
import { Request, Response } from "express";
import { paginateOptions } from "./common";
import { jwtDecode } from "jwt-decode";
import { usuarioPopulateSelect } from "../models/Usuario";
import Tarefas, { ITarefas } from "../models/Tarefas";
import { ObjectId } from "mongoose";

interface ICreateTarefaRequest {
    titulo: string;
    descricao: string;
    board_id: ObjectId;
    status: string;
    responsavel: ObjectId;
    data_inicial: Date;
    data_final: Date;
}

interface QueryParams {
    pagina?: string;
    limite?: string;
    board?: string;
}

export default class TarefaController {

    static async listarTarefa(req: Request<{}, {}, {}, QueryParams>, res: Response): Promise<Response> {
        const pagina = parseInt(req.query.pagina as string) || 1;
        const limite = parseInt(req.query.limite as string) || paginateOptions.limit;
        const { board } = req.query;

        // Filtros para a pesquisa
        const filtros: Record<string, any> = {};

        if (board) filtros.board = board;

        // Pegando o ID do usuário do token JWT
        const token = req.headers.authorization;
        if (!token) {
            return sendResponse(res, 401, { error: "Token de autenticação não fornecido." });
        }

        const tokenDecoded: any = jwtDecode(token);
        const userId = tokenDecoded.id;

        filtros.$or = [
            { "responsavel": userId },
        ];

        const tarefa = await Tarefas.paginate(
            filtros,
            {
                ...paginateOptions,
                page: pagina,
                limit: limite,
                sort: { _id: -1 },
                lean: true,
                populate: [
                    { path: "responsavel", select: usuarioPopulateSelect }
                ]
            }
        );

        // Retornando a resposta com os dados paginados
        return sendResponse(res, 200, { data: tarefa });
    }

    static async CriarTarefa(req: Request, res: Response): Promise<Response> {
        const dados: ICreateTarefaRequest = { ...req.body };

        const tarefa = new Tarefas(dados);

        const saveTarefa = await tarefa.save();

        return sendResponse(res, 200, { data: saveTarefa });
    }

    static async AlterarTarefas(req: Request, res: Response): Promise<Response> {
        const tarefa = req.validateResult.tarefa as ITarefas;

        for (let key in req.body) {

            if (key in tarefa) {
                (tarefa as any)[key] = req.body[key];
            }
        }

        await Tarefas.findByIdAndUpdate(tarefa._id, tarefa);

        return res.status(200).json({ data: tarefa })
    }
}