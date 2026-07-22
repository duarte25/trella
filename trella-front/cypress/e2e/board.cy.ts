describe("Criar Board", () => {
  let nomeBoard: string;

  beforeEach(() => {
    nomeBoard = `[e2e] Board Teste ${Date.now()}`;
    cy.login();
    cy.visit("/home");
  });

  afterEach(() => {
    cy.getCookie("accessToken").then((cookie) => {
      if (!cookie) return;

      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/boards?nome=${encodeURIComponent(nomeBoard)}`,
        headers: { Authorization: `Bearer ${cookie.value}` },
        failOnStatusCode: false,
      }).then((response) => {
        const boards = response.body?.data?.data || [];
        boards.forEach((board: { _id: string }) => {
          cy.request({
            method: "DELETE",
            url: `${Cypress.env("apiUrl")}/boards/${board._id}`,
            headers: { Authorization: `Bearer ${cookie.value}` },
            failOnStatusCode: false,
          });
        });
      });
    });
  });

  it("cria uma board com sucesso", () => {
    cy.get("[data-cy=nav-criar-board]").click();
    cy.url().should("include", "/criar-board");

    cy.get("[data-cy=board-nome-input]").type(nomeBoard);

    cy.get("[data-cy=board-usuarios-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=board-usuarios-combobox]").click();

    cy.get("[data-cy=board-submit-button]").click();

    cy.visit("/home");
    cy.contains("[data-test=celula-nome]", nomeBoard).should("be.visible");
  });

  it("não permite criar board sem nome", () => {
    cy.get("[data-cy=nav-criar-board]").click();
    cy.url().should("include", "/criar-board");

    cy.get("[data-cy=board-usuarios-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=board-usuarios-combobox]").click();

    cy.get("[data-cy=board-submit-button]").click();

    cy.contains("Deve ter no mínimo 3 caracteres").should("be.visible");
    cy.url().should("include", "/criar-board");
  });

  it("não permite criar board sem selecionar usuários", () => {
    cy.get("[data-cy=nav-criar-board]").click();
    cy.url().should("include", "/criar-board");

    cy.get("[data-cy=board-nome-input]").type(nomeBoard);
    cy.get("[data-cy=board-submit-button]").click();

    cy.contains("Deve ter no mínimo 1 elementos").should("be.visible");
    cy.url().should("include", "/criar-board");
  });

  it("não permite criar board sem nome e sem usuários", () => {
    cy.get("[data-cy=nav-criar-board]").click();
    cy.url().should("include", "/criar-board");

    cy.get("[data-cy=board-submit-button]").click();

    cy.contains("Deve ter no mínimo 3 caracteres").should("be.visible");
    cy.contains("Deve ter no mínimo 1 elementos").should("be.visible");
    cy.url().should("include", "/criar-board");
  });
});
