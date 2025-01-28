import emailValidate from "../../utils/emailValidate";
import messages from "../../utils/mensagens";
import Usuario from "../../models/Usuario";
import bcrypt from 'bcryptjs';
export default class AuthValidate {
    static async loginValidate(req, res, next) {
        try {
            const erros = [];
            const { email, senha } = req.body;
            let userExist; // Definimos como 'any' porque não sabemos exatamente o tipo do retorno de 'Usuario.findOne'
            if (emailValidate(email)) {
                // Procurar usuário no banco, incluindo a senha
                userExist = await Usuario.findOne({ email }).select("+senha");
                if (!userExist) {
                    return res.status(400).json({
                        data: [],
                        error: true,
                        code: 400,
                        message: messages.httpCodes[400],
                        errors: ["Usuário ou senha incorretos!"]
                    });
                }
                // Verifique se a senha foi fornecida
                if (!senha) {
                    return res.status(400).json({
                        data: [],
                        error: true,
                        code: 400,
                        message: messages.httpCodes[400],
                        errors: ["Senha não fornecida!"]
                    });
                }
                // Verifique se o campo de senha do usuário está definido
                if (!userExist.senha) {
                    return res.status(500).json({
                        data: [],
                        error: true,
                        code: 500,
                        message: messages.httpCodes[500],
                        errors: ["Erro interno: senha do usuário não encontrada!"]
                    });
                }
                // Aguardar a comparação assíncrona da senha
                const senhaCorreta = await bcrypt.compare(senha, userExist.senha);
                if (!senhaCorreta) {
                    return res.status(400).json({
                        data: [],
                        error: true,
                        code: 400,
                        message: messages.httpCodes[400],
                        errors: ["Usuário ou senha incorretos!"]
                    });
                }
            }
            else {
                erros.push(messages.customValidation.invalidMail);
            }
            // Se houver erros de validação
            return erros.length > 0 ? res.status(422).json({
                data: [],
                error: true,
                code: 422,
                message: messages.httpCodes[422],
                errors: erros
            }) : next();
        }
        catch (err) {
            // Assert that err is of type Error
            if (err instanceof Error) {
                return res.status(500).json({
                    data: [],
                    error: true,
                    code: 500,
                    message: messages.httpCodes[500],
                    errors: [err.message]
                });
            }
            // Handle other cases, for instance, when the error isn't an instance of Error
            return res.status(500).json({
                data: [],
                error: true,
                code: 500,
                message: messages.httpCodes[500],
                errors: ["Unknown error occurred"]
            });
        }
    }
}
