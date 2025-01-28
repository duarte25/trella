import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";
export var StatusTarefas;
(function (StatusTarefas) {
    StatusTarefas["OPEN"] = "Open";
    StatusTarefas["FAZENDO"] = "Fazendo";
    StatusTarefas["FEITO"] = "Feito";
    StatusTarefas["CLOSED"] = "Closed";
})(StatusTarefas || (StatusTarefas = {}));
export const tarefasPopulateSelect = { titulo: 1, descricao: 1 };
const tarefasSchema = new mongoose.Schema({
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
        maxlength: 554,
        required: true,
    },
    responsavel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuarios',
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
}, {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    versionKey: "_version",
});
tarefasSchema.index({ nome: "text" }, { default_language: "pt" });
// Configurações para permitir paginação
tarefasSchema.plugin(paginate);
const Tarefas = mongoose.model("Tarefas", tarefasSchema);
export default Tarefas;
