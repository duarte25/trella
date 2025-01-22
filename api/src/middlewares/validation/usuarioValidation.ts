import { Request, Response, NextFunction } from "express";
import { sendError } from "../../utils/mensagens";
import Usuario from "../../models/Usuario";
import { Validator, ValidationFuncs as v } from "./validation";

export default class UsuarioValidation {

    static async criarUsuarioValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const val = new Validator(req.body);
        
        // Validações
        await val.validate("nome", v.required(), v.trim(), v.length({ max: 50 }));
        await val.validate("email", v.required(), v.email(), v.unique({ model: Usuario, query: { email: req.body.email } }));
        await val.validate("cpf", v.required(), v.CPF(), v.unique({ model: Usuario, query: { cpf: req.body.cpf } }));
        await val.validate("senha", v.required(), v.passwordComplexity());

        if (val.anyErrors()) return sendError(res, 422, val.getErrors());

        req.body = val.getSanitizedBody();

        return next();
    }

    static async alterarUsuarioValidate(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        let val = new Validator(req.params);

        // Validar id
        await val.validate("id",
            v.required(),
            v.mongooseID(),
            v.toMongooseObj({ model: Usuario, query: { _id: req.params.id } })
        );

        // Erro 404 quando id não existe
        if (val.anyErrors()) return sendError(res, 404, val.getErrors());

        const usuario = val.getValue("id");

        val = new Validator(req.body);

        // Validações gerais
        await val.validate("nome", v.optional(), v.trim(), v.length({ max: 50 }));
        await val.validate("senha", v.optional(), v.passwordComplexity());

        const userId = req.params.id; // ID do usuário sendo alterado

        // Verificação do e-mail no banco de dados (ignora o e-mail se for o do próprio usuário)
        await val.validate("email", v.optional(), v.email(), v.unique({
            model: Usuario, 
            query: { email: req.body.email }, 
            ignoreSelf: true,  // Ignorar o próprio usuário
            userId: userId    // Passar o ID do usuário sendo alterado
        }));

        // Validação do CPF (opcional, como você já tinha)
        await val.validate("cpf", v.optional(), v.CPF(), v.unique({
            model: Usuario, 
            query: { cpf: req.body.cpf }, 
            ignoreSelf: true,  // Ignorar o próprio usuário
            userId: userId    // Passar o ID do usuário sendo alterado
        })); 

        // Verificar se existem erros
        if (val.anyErrors()) {
            return sendError(res, 422, val.getErrors());
        }

        usuario.senha = val.body.senha;

        req.body = val.getSanitizedBody(); // Sanitizando os dados
        req.validateResult = {
            usuario: usuario
        };

        return next(); // Passa para o próximo middleware ou controlador
    }
}
