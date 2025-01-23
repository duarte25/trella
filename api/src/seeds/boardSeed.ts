import { ObjectId } from "mongoose";
import Board from "../models/Board";
import Usuario from "../models/Usuario"; 
import faker from "faker-br";

// Definindo o tipo de cada objeto a ser criado
interface BoardCriado {
  nome: string;
  usuarios: ObjectId[];
  responsavel: ObjectId;
}

// Definindo o tipo da função, especificando que 'quantidade' é um número
export default async function boardSeed(quantidade: number): Promise<void> {
  const boardsCriados: BoardCriado[] = [];

  // Buscando 5 usuários aleatórios no banco de dados
  const usuarios = await Usuario.aggregate([
    { $sample: { size: 5 } } // Pega 5 usuários aleatórios
  ]);

  if (usuarios.length < 2) {
    console.log("Não há usuários suficientes para criar boards.");
    return;
  }

  // Criando os boards de forma dinâmica
  for (let i = 0; i < quantidade; i++) {
    // Usando faker-br para gerar o nome
    const nome = `${faker.name.firstName()} ${faker.name.lastName()}`;
    
    // Selecionando aleatoriamente 2 usuários
    const usuariosSelecionados = usuarios.slice(0, 2).map(usuario => usuario._id);

    // Selecionando um responsável aleatório
    const responsavel = usuarios[Math.floor(Math.random() * usuarios.length)]._id;

    // Adicionando o board criado ao array de boardsCriados
    boardsCriados.push({
      nome,
      usuarios: usuariosSelecionados,
      responsavel
    });
  }

  // Inserindo os boards na coleção do MongoDB
  await Board.insertMany(boardsCriados);

  console.log(`${quantidade} Boards inseridos com sucesso!`);
}
