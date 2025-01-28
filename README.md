#  Trella - Ferramenta para quadro de tarefa

<!-- ## 🗂️ Índice   -->
<!-- 1. [Descrição](#-descrição)  
2. [Tecnologias Utilizadas](#-tecnologias-utilizadas)  
3. [Funcionalidades da Aplicação](#️-funcionalidades-da-aplicação)  
4. [Como Utilizar](#-como-utilizar)  
5. [Dificuldades](#-dificuldades)  
6. [Desenvolvedores](#-desenvolvedores)   -->
<!-- --- -->

## 📄 Descrição  
Este projeto tem como objetivo desenvolver uma plataforma web responsiva e altamente interativa, projetada para facilitar a criação de ideias e o gerenciamento eficiente de tarefas de usuários. Utilizando tecnologias de ponta como React, Next.js, Express e Node.js, todas desenvolvidas em TypeScript, esta aplicação oferece uma experiência de usuário fluida, segura e escalável. O uso de TypeScript garante um código mais robusto e menos propenso a erros, proporcionando maior confiabilidade e manutenibilidade ao longo do ciclo de vida do projeto.

---

#### ☁️ **Aplicação Online na URL:** 

 [Trella.com](https://gustavo-3022.code.fslab.dev/)

Ou tente: https://gustavo-3022.code.fslab.dev/


## 💻 Tecnologias Utilizadas  

![React](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Next](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![Node](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-grey?style=for-the-badge&logo=tailwind-css&logoColor=38B2AC)  ![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=flat-square)  ![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=fff&style=flat) 

---

## ⚙️ Funcionalidades da Aplicação  
### 📚 Como Utilizar  

### **1. Permite criar usuários **  
- Ao ingressar no site, temos a possibilidade de entrar com login caso o usuário tenha uma conta, caso não tenha, insira alguns dados no registro e crie sua conta. 
- Para se registrar, deve criar conta com nome, e-mail, CPF e senha, a senha deve ser valida. Para gerar um CPF pode entrar no site e gerar um CPF sem pontuação: https://www.4devs.com.br/gerador_de_cpf

### **2. Criar Board e visualizar**  
- Ao ingressar no sistema, a primeira vez terá a opção de criar uma board e visualizar uma board, poderá apenas visualizar as Board que o usuário pertence, sendo responsável ou um usuário.
- Ao clicar para abrir a barra lateral direita e visualizar, clique em criar e crie um nome para a sua ideia. Seu quadro, o qual chamamos de Board, poderá selecionar os usuários que terão acesso ao seu quadro, não se preocupe, quem estiver criando o quadro será o responsável. 
- Após clicar em salvar, ao criar será direcionado ao home e poderá visualizar no ícone de olhinho sua Board.
- Temos a possibilidade de deletar o quadro caso seja responsável.
-

### **3. Visualizar tarefa e modificar**  
- Estando dentro da Board veremos 4 colunas, Open, Fazendo, Feito e Closed, temos a possibilidade de criar a tarefa clicando em um botão acima das colunas.
- Podemos editar essa tarefa que acabamos de criar e podemos deletar ela, caso necessário.
- Assim como os demais quadros, como o Trello ou até mesmo o próprio Board do GitLab temos a possibilidade de arrastar a atividade de Open para fazendo, de Fazendo para Closed e enfim, podemos arrastar, mudando assim o Status dessa atividade no banco e atualizando a tela.
---

### Passos para Execução

Com docker compose basta executar:

```
docker compose up --build -d
docker exec api npm run seed
```

---

## 👥 Desenvolvedores  
| [![Duarte](https://github.com/duarte25.png?size=120)](https://github.com/duarte25) |  
|:------------------------------------------------------------------------------------------------: 
|                              [Gustavo Duarte](https://github.com/duarte25)                                      | 