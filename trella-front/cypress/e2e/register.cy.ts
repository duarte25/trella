const SENHA_FORTE = "Dev@1234";

describe("Registro de Usuário", () => {
  const emailsCriados: string[] = [];

  afterEach(() => {
    emailsCriados.forEach((email) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/auth/profile?email=${encodeURIComponent(email)}`,
        failOnStatusCode: false,
      }).then((response) => {
        const usuarios: { id: string }[] = response.body?.data?.data || [];
        usuarios.forEach((u) => {
          cy.request({
            method: "DELETE",
            url: `${Cypress.env("apiUrl")}/auth/delete/${u.id}`,
            failOnStatusCode: false,
          });
        });
      });
    });
    emailsCriados.length = 0;
  });

  beforeEach(() => {
    cy.visit("/register");
  });

  it("exibe o formulário de registro com os campos esperados", () => {
    cy.get("form").should("exist");
    cy.get("[data-cy=registro-nome-input]").should("be.visible");
    cy.get("[data-cy=registro-cpf-input]").should("be.visible");
    cy.get("[data-cy=registro-email-input]").should("be.visible");
    cy.get("[data-cy=registro-senha-input]").should("be.visible");
    cy.get("[data-cy=registro-submit-button]").should("be.visible").and("contain.text", "Registrar");
    cy.get("[data-cy=registro-login-link]").should("be.visible");
  });

  it("navega para a tela de login pelo link 'Já tem uma conta?'", () => {
    cy.get("[data-cy=registro-login-link]").click();
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);
  });

  it("não permite registrar com todos os campos vazios", () => {
    cy.get("[data-cy=registro-submit-button]").click();

    cy.contains("Campo obrigatório").should("be.visible");
    cy.contains("Deve ter no mínimo 11 caracteres").should("be.visible");
    cy.contains("Deve ter no mínimo 8 caracteres").should("be.visible");
    cy.url().should("include", "/register");
  });

  it("não permite registrar com email em formato inválido", () => {
    cy.gerarCpfValido().then((cpf) => {
      cy.get("[data-cy=registro-nome-input]").type("Usuario Teste");
      cy.get("[data-cy=registro-cpf-input]").type(cpf);
      // Precisa ter "@" pra passar da validação NATIVA do navegador (o
      // input é type="email"), mas sem domínio com ponto o suficiente pra
      // falhar na validação mais estrita do zod.
      cy.get("[data-cy=registro-email-input]").type("emailsemdominiovalido@semponto");
      cy.get("[data-cy=registro-senha-input]").type(SENHA_FORTE);
      cy.get("[data-cy=registro-submit-button]").click();

      cy.contains("Email inválido").should("be.visible");
      cy.url().should("include", "/register");
    });
  });

  it("não permite registrar com CPF com dígito verificador inválido (validação do servidor)", () => {
    const email = `cypress.cpf.invalido.${Date.now()}@teste.com`;
    emailsCriados.push(email);

    cy.get("[data-cy=registro-nome-input]").type("Usuario Teste");
    // 11 dígitos (passa na validação do client, que só olha o tamanho),
    // mas com dígito verificador errado de propósito.
    cy.get("[data-cy=registro-cpf-input]").type("12345678900");
    cy.get("[data-cy=registro-email-input]").type(email);
    cy.get("[data-cy=registro-senha-input]").type(SENHA_FORTE);
    cy.get("[data-cy=registro-submit-button]").click();

    cy.contains("Valor informado em cpf é inválido").should("be.visible");
    cy.url().should("include", "/register");
  });

  it("não permite registrar com senha fraca (validação do servidor)", () => {
    const email = `cypress.senha.fraca.${Date.now()}@teste.com`;
    emailsCriados.push(email);

    cy.gerarCpfValido().then((cpf) => {
      cy.get("[data-cy=registro-nome-input]").type("Usuario Teste");
      cy.get("[data-cy=registro-cpf-input]").type(cpf);
      cy.get("[data-cy=registro-email-input]").type(email);
      // Só minúsculas, sem maiúscula/número/especial
      // exige min 8 caracteres.
      cy.get("[data-cy=registro-senha-input]").type("apenasminuscula");
      cy.get("[data-cy=registro-submit-button]").click();

      cy.contains("A senha deve ter pelo menos 8 caracteres").should("be.visible");
      cy.url().should("include", "/register");
    });
  });

  it("não permite registrar com um email já cadastrado", () => {
    cy.gerarCpfValido().then((cpf) => {
      cy.get("[data-cy=registro-nome-input]").type("Usuario Teste");
      cy.get("[data-cy=registro-cpf-input]").type(cpf);
      cy.get("[data-cy=registro-email-input]").type("usuario@gmail.com");
      cy.get("[data-cy=registro-senha-input]").type(SENHA_FORTE);
      cy.get("[data-cy=registro-submit-button]").click();

      cy.contains("já está em uso").should("be.visible");
      cy.url().should("include", "/register");
    });
  });

  it("registra com sucesso e consegue logar com a conta criada", () => {
    const email = `cypress.sucesso.${Date.now()}@teste.com`;
    emailsCriados.push(email);

    cy.gerarCpfValido().then((cpf) => {
      cy.get("[data-cy=registro-nome-input]").type("Usuario Criado Pelo Cypress");
      cy.get("[data-cy=registro-cpf-input]").type(cpf);
      cy.get("[data-cy=registro-email-input]").type(email);
      cy.get("[data-cy=registro-senha-input]").type(SENHA_FORTE);
      cy.get("[data-cy=registro-submit-button]").click();

      // Registro não loga automaticamente, só redireciona pro login.
      cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

      cy.get("[data-cy=email-input]").type(email);
      cy.get("[data-cy=senha-input]").type(SENHA_FORTE);
      cy.get("[data-cy=login-submit-button]").click();

      cy.url().should("include", "/home");
      cy.contains("Trella").should("be.visible");
    });
  });
});
