export interface Usuario {
    id: string;
    nome: string;
    cpf: string;
    email: string;
  }
  
export interface AuthContextType {
  token: string;
}