export interface Board {
  _id: string;
  nome: string;
  usuarios: Array<unknown>;
  responsavel: string;
  _version: number;
}
