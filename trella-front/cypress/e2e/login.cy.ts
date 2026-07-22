describe("Login", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("exibe o formulário de login com os campos esperados", () => {
    cy.get("form").should("exist");
    cy.get("[data-cy=email-input]").should("be.visible");
    cy.get("[data-cy=senha-input]").should("be.visible");
    cy.get("[data-cy=login-submit-button]").should("be.visible");
    cy.contains("Não tem uma conta?").should("be.visible");
    cy.get("[data-cy=register-link]").should("be.visible").and("contain.text", "Cadastre-se");
  });

  it("exibe erro ao tentar logar com credenciais inválidas", () => {
    cy.get("[data-cy=email-input]").type("usuario-invalido@trella.com");
    cy.get("[data-cy=senha-input]").type("senhaErrada123");
    cy.get("[data-cy=login-submit-button]").click();

    cy.contains("Usuário ou senha incorretos!").should("be.visible");
  });

  it("navega para a tela de registro", () => {
    cy.get("[data-cy=register-link]").click();
    cy.url().should("include", "/register");
  });

  it("loga com sucesso e é redirecionado para a home", () => {
    cy.get("[data-cy=email-input]").type(Cypress.env("loginEmail"));
    cy.get("[data-cy=senha-input]").type(Cypress.env("loginSenha"));
    cy.get("[data-cy=login-submit-button]").click();

    cy.url().should("include", "/home");
    cy.contains("Trella").should("be.visible");
  });
});
