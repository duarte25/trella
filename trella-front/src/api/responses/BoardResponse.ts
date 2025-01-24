import { Board } from "../models/Board";

export interface BoardResponse {
  data: Board[]; 
  limite: number;
  pagina: number;
  resultados: number;
  totalPaginas: number;
}

export interface QueryParams {
  pagina?: number;
  limite?: number;
}
