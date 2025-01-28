import db from "../config/db_config";
import boardSeed from "./boardSeed";
import tarefasSeed from "./tarefasSeed";
import usuarioSeed from "./usuarioSeed";
let quantidade = 50; // Defina a quantidade como um número
// Conectando ao banco de dados
await db.conectarBanco();
await db.getCollection("usuarios").deleteMany();
await db.getCollection("boards").deleteMany();
await db.getCollection("tarefas").deleteMany();
// Chama a função para inserir os usuários
await usuarioSeed(quantidade);
await boardSeed(quantidade);
await tarefasSeed(quantidade * 10);
// Desconectar do banco de dados
await db.desconetarBanco(); // Certifique-se de aguardar o fechamento da conexão
