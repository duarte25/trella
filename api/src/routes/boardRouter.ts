import express from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { wrapException } from "../utils/wrapException";
import BoardController from "../controllers/BoardController";
import BoardValidation from "../middlewares/validation/boardValidation";

const router = express.Router();

// Tipagem das rotas
router
    .post("/boards", AuthMiddleware, BoardValidation.CriarBoardValidate ,wrapException(BoardController.CriarBoard))
    .get("/boards", AuthMiddleware, wrapException(BoardController.listarBoard))
    // .get("/boards/:id", wrapException(UsuarioController.listarUsuarioID))
    .patch("/boards/:id", wrapException(BoardController.AlterarBoard))
    // .delete("/boards/:id", wrapException(UsuarioController.deletarUsuario));

export default router;
