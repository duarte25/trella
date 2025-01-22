import faker from "faker-br";
import Usuario from "../models/Usuario";
import bcrypt from "bcryptjs";

// Definindo o tipo de cada objeto a ser criado
interface UsuarioCriado {
    nome: string;
    cpf: string;
    email: string;
    senha: string;
}

// Definindo o tipo da função, especificando que 'quantidade' é um número
export default async function usuarioSeed(quantidade: number): Promise<void> {
    const usuariosCriados: UsuarioCriado[] = [];

    // Usuário fixo (não dentro do loop)
    usuariosCriados.push({
        nome: "Usuario",
        cpf: faker.br.cpf(),
        email: "usuario@gmail.com",
        senha: bcrypt.hashSync("Dev@1234", 8)
    });

    // Criando os usuários de forma dinâmica
    for (let i = 0; i < quantidade; i++) {
        // Usando faker-br para gerar o CPF e nome completo manualmente
        const nome = `${faker.name.firstName()} ${faker.name.lastName()}`;
        usuariosCriados.push({
            nome,
            cpf: faker.br.cpf(),
            email: faker.internet.email(),
            senha: bcrypt.hashSync("Dev@1234", 8)
        });
    }

    // Inserindo os usuários na coleção do MongoDB
    await Usuario.insertMany(usuariosCriados);

    console.log((quantidade + 1) + " Usuários inseridos");
}
