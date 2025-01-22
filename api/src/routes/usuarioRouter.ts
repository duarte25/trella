import express, { Request, Response, NextFunction } from "express";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import UsuarioController from "../controllers/UsuarioController";
import usuarioValidation from "../middlewares/validation/usuarioValidation";
import { wrapException } from "../utils/wrapException";

const router = express.Router();

// Tipagem das rotas
router
    .post("/auth/register", usuarioValidation.criarUsuarioValidate, wrapException(UsuarioController.CriarUsuario))
    .get("/auth/profile",  wrapException(UsuarioController.listarUsuario))
    .get("/auth/profile/:id", wrapException(UsuarioController.listarUsuarioID))
    .patch("/auth/alter/:id", AuthMiddleware, usuarioValidation.alterarUsuarioValidate, wrapException(UsuarioController.alterarUsuario))
    .delete("/auth/delete/:id", AuthMiddleware, wrapException(UsuarioController.deletarUsuario));

export default router;
