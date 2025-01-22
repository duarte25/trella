import * as express from "express";
import { IUsuario } from "./models/Usuario"; // Importe sua interface IUsuario

declare global {
  namespace Express {
    interface Request {
      validateResult: {
        usuario: IUsuario;
      };
    }
  }
}
