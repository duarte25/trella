import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
// Definindo o esquema para o modelo de usuário
const boardSchema = new mongoose.Schema({
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
}, {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: "_version",
});
boardSchema.index({ nome: "text" }, { default_language: "pt" });
// Configurações para permitir paginação
boardSchema.plugin(paginate);
// Criando o modelo de usuário com o tipo IUsuario e PaginateModel
const Board = mongoose.model("Boards", boardSchema);
export default Board;
