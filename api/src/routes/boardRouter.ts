import express from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { wrapException } from "../utils/wrapException";
import BoardController from "../controllers/BoardController";

const router = express.Router();

// Tipagem das rotas
router
    // .post("/boards", usuarioValidation.criarUsuarioValidate, wrapException(UsuarioController.CriarUsuario))
    .get("/boards", AuthMiddleware, wrapException(BoardController.listarBoard))
    // .get("/boards/:id", wrapException(UsuarioController.listarUsuarioID))
    // .patch("/boards/:id",  usuarioValidation.alterarUsuarioValidate, wrapException(UsuarioController.alterarUsuario))
    // .delete("/boards/:id", wrapException(UsuarioController.deletarUsuario));

export default router;
