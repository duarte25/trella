import mongoose, { Document, Schema, ObjectId, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

export enum StatusTarefas {
    OPEN = "Open",
    FAZENDO = "Fazendo",
    FEITO = "Feito",
    CLOSED = "Closed"
}

export interface ITarefas extends Document {
    _id: ObjectId;
    board_id: ObjectId;
    status: StatusTarefas;
    titulo: string;
    descricao: string;
    responsavel: ObjectId;
    data_inicial: Date;
    data_final: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const tarefasPopulateSelect = { titulo: 1, descricao: 1 };
const tarefasSchema: Schema<ITarefas> = new mongoose.Schema(
    {
        board_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Boards',
            required: true,
        },
        status: {
            type: String,
            enum: Object.values(StatusTarefas),
            required: true,
        },
        titulo: {
            type: String,
            minlength: 3,
            maxlength: 200,
            required: true,
        },
        descricao: {
            type: String,
            minlength: 1,
            maxlength: 554
        },
        responsavel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true,
        },
        data_inicial: {
            type: Date,
            required: true    
        },
        data_final: {
            type: Date,
            required: true    
        },
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        versionKey: "_version",
    }
);

tarefasSchema.index({ nome: "text" }, { default_language: "pt" });
// Configurações para permitir paginação
tarefasSchema.plugin(paginate);

const Tarefas = mongoose.model<ITarefas, PaginateModel<ITarefas>>("Tarefas", tarefasSchema);

export default Tarefas;
