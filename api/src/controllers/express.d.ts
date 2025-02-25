import * as express from "express";
import { IUsuario } from "./models/Usuario"; // Importe sua interface IUsuario
import { IBoard } from "../models/Board";

declare global {
  namespace Express {
    interface Request {
      validateResult: {
        tarefa?: ITarefas;
        usuario?: IUsuario;
        board?: IBoard;
      };
    }
  }
}
