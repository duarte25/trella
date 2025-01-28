import BoardValidation from "../middlewares/validation/boardValidation";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import BoardController from "../controllers/BoardController";
import { wrapException } from "../utils/wrapException";
import express from "express";
const router = express.Router();
// Tipagem das rotas
router
    .post("/boards", AuthMiddleware, BoardValidation.CriarBoardValidate, wrapException(BoardController.CriarBoard))
    .get("/boards", AuthMiddleware, wrapException(BoardController.listarBoard))
    .get("/boards/:id", AuthMiddleware, BoardValidation.listarIDBoardValidate, wrapException(BoardController.listarBoardID))
    .patch("/boards/:id", AuthMiddleware, BoardValidation.AlterarBoardValidate, wrapException(BoardController.AlterarBoard))
    .delete("/boards/:id", AuthMiddleware, BoardValidation.deleteBoardValidate, wrapException(BoardController.deletarBoard));
export default router;
