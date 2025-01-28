export interface Tarefa {
    _id: string;
    board_id: string;
    status: string;
    titulo: string;
    descricao: string;
    responsavel: {
        _id: string;
        nome: string;
        email: string;
    };
    data_inicial: string;
    data_final: string;
    _version: number;
    createdAt: string;
    updatedAt: string;
}

export interface TarefaResponsavel {
    board_id: string;
    status: string;
    titulo: string;
    descricao: string;
    responsavel: string,
    data_inicial: string;
    data_final: string;
}