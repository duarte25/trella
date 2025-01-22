import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

const bancoUrl: string | undefined = "mongodb://root:panelaNotificacaoDB@localhost:27100/panelanotificacaodb?authSource=admin";

// Função para conectar ao banco de dados
async function conectarBanco(): Promise<void> {
  // Verifica se já está conectado
  if (mongoose.connection.readyState === 1) return; // já está conectado

  if (!bancoUrl) {
    throw new Error(
      "Impossível se conectar ao banco de dados. \nÉ necessário configurar a variável de ambiente DB_URL com a string de conexão do banco de dados."
    );
  }

  try {
    mongoose.set("strictQuery", true);

    // Log para debug
    if (process.env.DEBUGLOG === "true") {
      console.log("Tentando conexão com banco...");
    }

    mongoose.connection
      .on("open", () => {
        if (process.env.DEBUGLOG === "true")
          console.log("Conexão com banco estabelecida com sucesso!");
      })
      .on("error", (err) => {
        console.log("Erro no banco de dados:", err);
      })
      .on("disconnected", () => {
        if (process.env.DEBUGLOG === "true")
          console.log("Desconectou do banco de dados.");
      });

    // Realiza a conexão com o banco de dados sem usar 'useNewUrlParser' ou 'useUnifiedTopology'
    await mongoose.connect(bancoUrl);
  } catch (error) {
    console.log("Erro ao conectar com banco " + error);
    throw error; // Não iniciar o servidor se não conseguir se conectar
  }
}

// Função para desconectar do banco de dados
async function desconetarBanco(): Promise<void> {
  if (process.env.DEBUGLOG === "true") console.log("Solicitando encerramento da conexão com banco");

  await mongoose.connection.close();
}

// Função para acessar a coleção
function getCollection(nomeColecao: string) {
  return mongoose.connection.collection(nomeColecao);
}

// Se o Node terminar, encerra a conexão com o Mongoose
process
  .on("SIGINT", async () => {
    await desconetarBanco();
    process.exit();
  })
  .on("SIGTERM", async () => {
    await desconetarBanco();
    process.exit();
  });

// Exporta o objeto contendo as funções e a conexão com o banco
export default {
  conectarBanco,
  desconetarBanco,
  getCollection,  // Agora é possível acessar collections
  mongoose, // Incluímos o mongoose caso precise de mais funções
};
