import { Usuario } from "../models/Usuario";

export interface LoginResponse {
  token: string;
  user: Usuario;
}
