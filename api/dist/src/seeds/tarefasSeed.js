import Usuario from "../models/Usuario";
import { faker } from "@faker-js/faker";
import Tarefas, { StatusTarefas } from "../models/Tarefas";
import Board from "../models/Board";
// Definindo o tipo da função, especificando que 'quantidade' é um número
export default async function tarefasSeed(quantidade) {
    const tarefasCriadas = [];
    const usuarios = await Usuario.find().lean();
    const boards = await Board.find().lean();
    // Obtendo os valores do enum StatusTarefas
    const statusPossiveis = Object.values(StatusTarefas);
    // Criando as tarefas de forma dinâmica
    for (let i = 0; i < quantidade; i++) {
        const board_id = boards[Math.floor(Math.random() * boards.length)]._id;
        // Selecionando um status aleatório
        const status = statusPossiveis[Math.floor(Math.random() * statusPossiveis.length)];
        // Usando faker para gerar o título e a descrição
        const titulo = faker.lorem.words(3); // Gera um título com 3 palavras
        const descricao = faker.lorem.sentence(); // Gera uma descrição aleatória
        // Selecionando um responsável aleatório
        const responsavel = usuarios[Math.floor(Math.random() * usuarios.length)]._id;
        // Gerando datas iniciais e finais apenas com dia, mês e ano
        const data_inicial = new Date(faker.date.past().getFullYear(), faker.date.past().getMonth(), faker.date.past().getDate());
        const data_final = new Date(faker.date.future().getFullYear(), faker.date.future().getMonth(), faker.date.future().getDate());
        // Adicionando a tarefa criada ao array de tarefasCriadas
        tarefasCriadas.push({
            board_id,
            status,
            titulo,
            descricao,
            responsavel,
            data_inicial,
            data_final
        });
    }
    // Inserindo as tarefas na coleção do MongoDB
    await Tarefas.insertMany(tarefasCriadas);
    console.log(`${quantidade} Tarefas inseridas com sucesso!`);
}
