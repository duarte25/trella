import TarefaController from "../controllers/TarefaController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import TarefaValidation from "../middlewares/validation/tarefaValidation";
import { wrapException } from "../utils/wrapException";
import express from "express";

const router = express.Router();

// Tipagem das rotas
router
    .post("/tarefas", AuthMiddleware, TarefaValidation.CriarTarefaValidate ,wrapException(TarefaController.CriarTarefa))
    .get("/tarefas", AuthMiddleware, wrapException(TarefaController.listarTarefa))
    // .get("/tarefas/:id", AuthMiddleware, BoardValidation.listarIDBoardValidate, wrapException(BoardController.listarBoardID))
    .patch("/tarefas/:id", AuthMiddleware, TarefaValidation.AlterarTarefaValidate, wrapException(TarefaController.AlterarTarefas))
    .delete("/tarefas/:id", AuthMiddleware, TarefaValidation.deleteTarefaValidate, wrapException(TarefaController.deletarTarefa));

export default router;
