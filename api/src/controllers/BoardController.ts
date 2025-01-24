import { Request, Response } from "express";
import { paginateOptions } from "./common";
import Board from "../models/Board";
import messages, { sendResponse } from "../utils/mensagens";
import { jwtDecode } from "jwt-decode";
import { ObjectId } from "mongoose";

interface ICreateBoardRequest {
    nome: string;
    usuarios: ObjectId[];
    responsavel: ObjectId;
}

interface QueryParams {
    pagina?: string;
    limite?: string;
    nome?: string;
    // cpf?: string;
    // email?: string;
}

export default class BoardController {

    static async listarBoard(req: Request<{}, {}, {}, QueryParams>, res: Response): Promise<Response> {
        const pagina = parseInt(req.query.pagina as string) || 1;
        const limite = parseInt(req.query.limite as string) || paginateOptions.limit;
        const { nome } = req.query;

        // Filtros para a pesquisa
        const filtros: Record<string, any> = {};

        if (nome) {
            filtros.$text = {
                $search: nome,
                $caseSensitive: false,
                $diacriticSensitive: false,
                $language: "pt"
            };
        }

        try {
            // Pegando o ID do usuário do token JWT
            const token = req.headers.authorization;
            if (!token) {
                return sendResponse(res, 401, { error: "Token de autenticação não fornecido." });
            }

            const tokenDecoded: any = jwtDecode(token);
            const userId = tokenDecoded.id;

            filtros.$or = [
                { "responsavel": userId },
                { "usuarios": { $in: [userId] } }
            ];

            const board = await Board.paginate(
                filtros,
                {
                    ...paginateOptions,
                    page: pagina,
                    limit: limite,
                    sort: { _id: -1 },
                    lean: true,
                }
            );

            // Retornando a resposta com os dados paginados
            return sendResponse(res, 200, { data: board });
        } catch (err: any) {
            // Caso ocorra erro, retorna o erro com status 500
            return sendResponse(res, 500, { error: true, message: err.message });
        }
    }

    static async CriarBoard(req: Request, res: Response): Promise<Response> {
        try {
            const dados: ICreateBoardRequest = { ...req.body };

            const board = new Board(dados);

            const saveBoard = await board.save();

            // Retornando o usuário sem a senha
            return res.status(201).json({
                data: saveBoard,
                error: false,
                code: 201,
                message: messages.httpCodes[201],
                errors: []
            });

        } catch (err: any) {
            return res.status(500).json({
                data: [],
                error: true,
                code: 500,
                message: messages.httpCodes[500],
                errors: err.message
            });
        }
    }

    
}