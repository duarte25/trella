import Usuario from "../models/Usuario";
import jwt from "jsonwebtoken";
import messages from "../utils/mensagens";
export default class AuthController {
    static async logar(req, res) {
        const { email } = req.body;
        // Verificar se o usuário existe no banco
        const userExist = await Usuario.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        // Gerar token JWT
        const token = jwt.sign({
            id: userExist._id,
            nome: userExist.nome,
            email: userExist.email
        }, process.env.JWT_SECRET, // Garantir que JWT_SECRET esteja definido
        {
            expiresIn: process.env.JWT_EXPIREIN || "1h", // Usar valor padrão caso não esteja definido
        });
        const data = {
            token,
            user: {
                id: userExist._id,
                nome: userExist.nome,
                email: userExist.email
            }
        };
        // Retornando o usuário sem a senha
        return res.status(201).json({
            data: data,
            error: false,
            code: 201,
            message: messages.httpCodes[200],
            errors: []
        });
    }
}
