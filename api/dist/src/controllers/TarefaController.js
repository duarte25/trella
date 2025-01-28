import messages, { sendResponse } from "../utils/mensagens";
import { paginateOptions } from "./common";
import { jwtDecode } from "jwt-decode";
import { usuarioPopulateSelect } from "../models/Usuario";
import Tarefas from "../models/Tarefas";
export default class TarefaController {
    static async listarTarefa(req, res) {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || paginateOptions.limit;
        const { board_id } = req.query;
        // Filtros para a pesquisa
        const filtros = {};
        if (board_id)
            filtros.board_id = board_id;
        // Pegando o ID do usuário do token JWT
        const token = req.headers.authorization;
        if (!token) {
            return sendResponse(res, 401, { error: "Token de autenticação não fornecido." });
        }
        const tokenDecoded = jwtDecode(token);
        const userId = tokenDecoded.id;
        // filtros.$or = [
        //     { "responsavel": userId },
        // ];
        const tarefa = await Tarefas.paginate(filtros, {
            ...paginateOptions,
            page: pagina,
            limit: limite,
            sort: { _id: -1 },
            lean: true,
            populate: [
                { path: "responsavel", select: usuarioPopulateSelect }
            ]
        });
        // Retornando a resposta com os dados paginados
        return sendResponse(res, 200, { data: tarefa });
    }
    static async CriarTarefa(req, res) {
        const dados = { ...req.body };
        const tarefa = new Tarefas(dados);
        const saveTarefa = await tarefa.save();
        return sendResponse(res, 200, { data: saveTarefa });
    }
    static async AlterarTarefas(req, res) {
        const tarefa = req.validateResult.tarefa;
        for (let key in req.body) {
            if (key in tarefa) {
                tarefa[key] = req.body[key];
            }
        }
        await Tarefas.findByIdAndUpdate(tarefa._id, tarefa);
        return res.status(200).json({ data: tarefa });
    }
    static async deletarTarefa(req, res) {
        const { id } = req.params;
        const findTarefa = await Tarefas.findByIdAndDelete(id);
        if (!findTarefa) {
            return res.status(404).json({ data: [], error: true, code: 404, message: messages.httpCodes[404], errors: [messages.validationGeneric.mascCamp("Tarefa")] });
        }
        return sendResponse(res, 200, {});
    }
}
