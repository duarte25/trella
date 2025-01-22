import { Request, Response } from "express";
import Usuario, { IUsuario } from "../models/Usuario";
import jwt from "jsonwebtoken";

export default class AuthController {
    static async logar(req: Request, res: Response): Promise<Response> {
        const { email } = req.body;

        // Verificar se o usuário existe no banco
        const userExist = await Usuario.findOne({ email });

        if (!userExist) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                id: userExist._id,
                nome: userExist.nome,
                email: userExist.email
            },
            process.env.JWT_SECRET as string, // Garantir que JWT_SECRET esteja definido
            {
                expiresIn: process.env.JWT_EXPIREIN || "1h", // Usar valor padrão caso não esteja definido
            }
        );

        // Retornar a resposta com o token e os dados do usuário
        return res.status(200).json({
            token,
            user: {
                id: userExist._id,
                nome: userExist.nome,
                email: userExist.email
            },
        });
    }
}
