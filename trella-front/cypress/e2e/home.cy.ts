describe("Home", () => {
  beforeEach(() => {
    cy.login();
    cy.visit("/home");
  });

  it("acessa a home já autenticado, sem passar pela tela de login", () => {
    cy.url().should("include", "/home");
    cy.contains("Trella").should("be.visible");
  });
});
