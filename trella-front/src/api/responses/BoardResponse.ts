import { Board } from "../models/Board";

export interface BoardResponseData {
  data: Board[]; 
  resultados: number;
  limite: number;
  totalPaginas: number;
  pagina: number;
}

export interface BoardResponse {
  data: BoardResponseData;
  error: boolean;
  code: number;
  message: string;
  errors: unknown[];
}

export interface QueryParams {
  pagina?: number;
  limite?: number;
}
