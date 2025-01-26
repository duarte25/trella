import { Tarefa } from "../models/Tarefa";

export interface TarefaResponseData {
  data: Tarefa[]; 
  resultados: number;
  limite: number;
  totalPaginas: number;
  pagina: number;
}

export interface TarefaResponse {
  data: TarefaResponseData;
  error: boolean;
  code: number;
  message: string;
  errors: unknown[];
}