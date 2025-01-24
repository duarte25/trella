import messages, { sendResponse } from "../utils/mensagens";
import Board, { IBoard } from "../models/Board";
import { Request, Response } from "express";
import { paginateOptions } from "./common";
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
    }

    static async listarBoardID(req: Request, res: Response): Promise<Response> {
        const board = req.validateResult.board as IBoard;

        return sendResponse(res, 200, { data: board });
    }

    static async CriarBoard(req: Request, res: Response): Promise<Response> {
        const dados: ICreateBoardRequest = { ...req.body };

        const board = new Board(dados);

        const saveBoard = await board.save();

        return sendResponse(res, 200, { data: saveBoard });
    }

    static async AlterarBoard(req: Request, res: Response): Promise<Response> {
        const board = req.validateResult.board as IBoard;

        for (let key in req.body) {

            if (key in board) {
                (board as any)[key] = req.body[key];
            }
        }

        await Board.findByIdAndUpdate(board._id, board);

        return res.status(200).json({ data: board })
    }

    static async deletarBoard(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        const findBoard = await Board.findByIdAndDelete(id);

        if (!findBoard) {
            return res.status(404).json({ data: [], error: true, code: 404, message: messages.httpCodes[404], errors: [messages.validationGeneric.mascCamp("Board")] });
        }

        return sendResponse(res, 200, {});
    }
}