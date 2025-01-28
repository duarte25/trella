import mongoose, { Document, Schema, ObjectId, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

// Definindo a interface para o tipo de Documento do board o qual o usuarios deve ser array
export interface IBoard extends Document {
    _id: ObjectId; // Use ObjectId em vez de string, caso o MongoDB esteja usando ObjectId
    nome: string;
    usuarios: ObjectId[];
    responsavel: ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Definindo o esquema para o modelo de usuário
const boardSchema: Schema<IBoard> = new mongoose.Schema(
    {
        nome: {
            type: String,
            minlength: 3,
            maxlength: 200,
            required: true,
        },
        usuarios: {
            type: [mongoose.Schema.Types.ObjectId], 
            ref: 'Usuarios',
            required: true,
        },
        responsavel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuarios', 
            required: true,
        }
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
        versionKey: "_version",
    }
);

boardSchema.index({ nome: "text" }, { default_language: "pt" });
// Configurações para permitir paginação
boardSchema.plugin(paginate);

// Criando o modelo de usuário com o tipo IUsuario e PaginateModel
const Board = mongoose.model<IBoard, PaginateModel<IBoard>>("Boards", boardSchema);

export default Board;
