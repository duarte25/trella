import { Request, Response } from "express";
import idValidate from "../utils/idValidate";
import Usuario, { IUsuario } from "../models/Usuario"; // Ajuste a importação do seu modelo de Usuário
import messages, { sendResponse } from "../utils/mensagens";
import { paginateOptions } from "./common";
import bcrypt from "bcryptjs";

// Interface para tipar o corpo da requisição
interface ICreateUserRequest {
    nome: string;
    email: string;
    cpf: string;
    senha: string;
}

interface QueryParams {
    pagina?: string;
    limite?: string;
    nome?: string;
    cpf?: string;
    email?: string;
}

export default class UsuarioController {

    // Método para criar usuário
    static async CriarUsuario(req: Request, res: Response): Promise<Response> {
        try {
            // Criptografando a senha
            const dados: ICreateUserRequest = { ...req.body, senha: bcrypt.hashSync(req.body.senha, 10) };

            // Criando um novo usuário
            const usuario = new Usuario(dados);

            // Salvando o usuário
            const saveUser = await usuario.save();

            // Removendo a senha do objeto de resposta
            const { senha, ...usuarioSemSenha } = saveUser.toObject();

            // Retornando o usuário sem a senha
            return res.status(201).json({
                data: usuarioSemSenha,
                error: false,
                code: 201,
                message: messages.httpCodes[201],
                errors: []
            });

        } catch (err: any) {
            return res.status(500).json({
                data: [],
                error: true,
                code: 500,
                message: messages.httpCodes[500],
                errors: err.message
            });
        }
    }

    // Método para listar usuários
    static async listarUsuario(req: Request<{}, {}, {}, QueryParams>, res: Response): Promise<Response> {
        const pagina = parseInt(req.query.pagina as string) || 1;
        const limite = parseInt(req.query.limite as string) || paginateOptions.limit; // Limite padrão de paginateOptions
        const { nome, cpf, email } = req.query;

        // Filtros para a pesquisa
        const filtros: Record<string, any> = {};

        if (nome) {
            filtros.$text = {
                $search: nome,
                $caseSensitive: false,
                $diacriticSensitive: false,
                $language: "pt"
            };
        }

        if (cpf) filtros.cpf = cpf;
        if (email) filtros.email = email;

        try {
            // Aqui você continua usando o paginateOptions para usar a configuração customizada de paginação
            const usuario = await Usuario.paginate(
                filtros,
                {
                    ...paginateOptions, // Aplica as opções customizadas de paginação
                    page: pagina,       // Página atual
                    limit: limite,      // Limite de resultados por página
                    sort: { _id: -1 },  // Ordenação padrão por _id
                    lean: true,         // Usar o método lean() para obter documentos sem métodos do Mongoose
                }
            );

            // Retornando a resposta com os dados paginados
            return sendResponse(res, 200, { data: usuario });
        } catch (err: any) {
            // Caso ocorra erro, retorna o erro com status 500
            return sendResponse(res, 500, { error: true, message: err.message });
        }
    }

    // Método para listar um usuário por ID
    static async listarUsuarioID(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        if (!idValidate(id)) {
            return res.status(422).json({ data: [], error: true, code: 422, message: messages.httpCodes[422], errors: [messages.error.invalidID] });
        }

        const findUser = await Usuario.findById(id);

        if (!findUser) {
            return res.status(404).json({ data: [], error: true, code: 404, message: messages.httpCodes[404], errors: [messages.validationGeneric.mascCamp("Usuário")] });
        }

        return sendResponse(res, 200, { data: findUser });
    }

   // Método para alterar um usuário
   static async alterarUsuario(req: Request, res: Response): Promise<Response> {
    // Pega o usuário do validador
    const usuario = req.validateResult.usuario as IUsuario;
    const { senha } = req.body;

    // Só atualiza os campos que foram enviados
    for (let key in req.body) {
        // Garantir que estamos acessando apenas as chaves válidas do tipo IUsuario
        if (key in usuario) {
            // Acessa de forma segura as propriedades de usuario, usando keyof IUsuario
            (usuario as any)[key] = req.body[key]; // Usando any para contornar o erro do TypeScript
        }
    }

    if (senha) {
        usuario.senha = bcrypt.hashSync(senha, 10);
    }

    await Usuario.findByIdAndUpdate(usuario._id, usuario);

    return res.status(200).json({ data: usuario });
    }

    // Método para deletar um usuário
    static async deletarUsuario(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;

        if (!idValidate(id)) {
            return res.status(422).json({ data: [], error: true, code: 422, message: messages.httpCodes[422], errors: [messages.error.invalidID] });
        }

        const findUser = await Usuario.findByIdAndDelete(id);

        if (!findUser) {
            return res.status(404).json({ data: [], error: true, code: 404, message: messages.httpCodes[404], errors: [messages.validationGeneric.mascCamp("Usuário")] });
        }

        return sendResponse(res, 200, {});
    }
}
