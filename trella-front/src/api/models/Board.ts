export interface Board {
  _id: string;
  nome: string;
  usuarios: Array<unknown>;
  responsavel: {
    _id: string;
    nome: string;
    cpf: string;
  };
  _version: number;
}
