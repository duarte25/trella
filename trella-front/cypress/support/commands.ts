/// <reference types="cypress" />

Cypress.Commands.add("login", (email, senha) => {
  const loginEmail = email || Cypress.env("loginEmail");
  const loginSenha = senha || Cypress.env("loginSenha");

  cy.session(
    [loginEmail, loginSenha],
    () => {
      cy.request("POST", `${Cypress.env("apiUrl")}/auth/login`, {
        email: loginEmail,
        senha: loginSenha,
      }).then((response) => {
        cy.setCookie("accessToken", response.body.data.token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          path: "/",
        });
      });
    },
    {
      validate() {
        cy.getCookie("accessToken").should("exist");
      },
    },
  );
});
