import messages, { sendResponse } from "../utils/mensagens";
import Board from "../models/Board";
import { paginateOptions } from "./common";
import { jwtDecode } from "jwt-decode";
import { usuarioPopulateSelect } from "../models/Usuario";
export default class BoardController {
    static async listarBoard(req, res) {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || paginateOptions.limit;
        const { nome } = req.query;
        // Filtros para a pesquisa
        const filtros = {};
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
        const tokenDecoded = jwtDecode(token);
        const userId = tokenDecoded.id;
        filtros.$or = [
            { "responsavel": userId },
            { "usuarios": { $in: [userId] } }
        ];
        const board = await Board.paginate(filtros, {
            ...paginateOptions,
            page: pagina,
            limit: limite,
            sort: { _id: -1 },
            lean: true,
            populate: [
                { path: "usuarios", select: usuarioPopulateSelect },
                { path: "responsavel", select: usuarioPopulateSelect }
            ]
        });
        // Retornando a resposta com os dados paginados
        return sendResponse(res, 200, { data: board });
    }
    static async listarBoardID(req, res) {
        const board = req.validateResult.board;
        return sendResponse(res, 200, { data: board });
    }
    static async CriarBoard(req, res) {
        const dados = { ...req.body };
        const board = new Board(dados);
        const saveBoard = await board.save();
        return sendResponse(res, 200, { data: saveBoard });
    }
    static async AlterarBoard(req, res) {
        const board = req.validateResult.board;
        for (let key in req.body) {
            if (key in board) {
                board[key] = req.body[key];
            }
        }
        await Board.findByIdAndUpdate(board._id, board);
        return res.status(200).json({ data: board });
    }
    static async deletarBoard(req, res) {
        const { id } = req.params;
        const findBoard = await Board.findByIdAndDelete(id);
        if (!findBoard) {
            return res.status(404).json({ data: [], error: true, code: 404, message: messages.httpCodes[404], errors: [messages.validationGeneric.mascCamp("Board")] });
        }
        return sendResponse(res, 200, {});
    }
}
