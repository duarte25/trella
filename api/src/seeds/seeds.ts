import db from "../config/db_config";
import boardSeed from "./boardSeed";
import tarefasSeed from "./tarefasSeed";
import usuarioSeed from "./usuarioSeed";

let quantidade: number = 50; // Defina a quantidade como um número

// Conectando ao banco de dados
await db.conectarBanco();

// Usando o método getCollection para acessar a coleção
await db.getCollection("usuarios").deleteMany({});  // Adicione {} para garantir que seja um objeto vazio

// Chama a função para inserir os usuários
await usuarioSeed(quantidade);

await boardSeed(quantidade);

await tarefasSeed(quantidade * 10)

// Desconectar do banco de dados
await db.desconetarBanco(); // Certifique-se de aguardar o fechamento da conexão
