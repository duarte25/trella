import mongoose, { Document, Schema, ObjectId, PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

// Definindo a interface para o tipo de Documento do usuário
export interface IUsuario extends Document {
  _id: ObjectId; // Use ObjectId em vez de string, caso o MongoDB esteja usando ObjectId
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  createdAt: Date;
  updatedAt: Date;
}

// Definindo o esquema para o modelo de usuário
export const usuarioPopulateSelect = { nome: 1, email: 1 };
const usuarioSchema: Schema<IUsuario> = new mongoose.Schema(
  {
    nome: {
      type: String,
      minlength: 3,
      maxlength: 200,
      required: true,
    },
    cpf: {
      type: String,
      minlength: 11,
      maxlength: 11,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    senha: {
      type: String,
      required: true,
      select: false,
      minlength: 8,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: "_version",
  }
);

usuarioSchema.index({ nome: "text" }, { default_language: "pt" });
// Configurações para permitir paginação
usuarioSchema.plugin(paginate);

// Criando o modelo de usuário com o tipo IUsuario e PaginateModel
const Usuario = mongoose.model<IUsuario, PaginateModel<IUsuario>>("Usuarios", usuarioSchema);

export default Usuario;
