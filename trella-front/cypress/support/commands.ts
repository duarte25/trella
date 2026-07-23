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

// Apaga TODOS os boards do usuário logado (não só os com um prefixo
// específico). Só é seguro porque rodamos contra um banco isolado só de
// teste (ver e2e-env.sh) — nunca use isto contra um ambiente com dados
// reais. Existe porque o boardSeed.ts sorteia aleatoriamente quem é
// responsável/membro de cada board, então o usuário de teste pode
// "ganhar" boards do seed sem a gente pedir.
Cypress.Commands.add("limparBoardsDoUsuario", () => {
  cy.getCookie("accessToken").then((cookie) => {
    const token = cookie?.value;

    cy.request({
      method: "GET",
      url: `${Cypress.env("apiUrl")}/boards?limite=200`,
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const boards: { _id: string }[] = response.body?.data?.data || [];

      boards.forEach((b) => {
        cy.request({
          method: "DELETE",
          url: `${Cypress.env("apiUrl")}/boards/${b._id}`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        });
      });
    });
  });
});

// Cria um board direto via API (bem mais rápido que preencher a tela) com
// o usuário logado como responsável e um segundo usuário qualquer como
// membro. Retorna o board criado.
Cypress.Commands.add("criarBoardViaApi", (nome: string) => {
  return cy.getCookie("accessToken").then((cookie) => {
    const token = cookie?.value;

    return cy
      .request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/auth/profile?limite=1`,
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((usuariosResponse) => {
        const usuarioId = usuariosResponse.body.data.data[0].id;

        return cy
          .request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/boards`,
            headers: { Authorization: `Bearer ${token}` },
            body: { nome, usuarios: [usuarioId] },
          })
          .then((createResponse) => createResponse.body.data);
      });
  });
});

// Arrasta um elemento até outro. O @hello-pangea/dnd (fork do
// react-beautiful-dnd) NÃO usa o drag-and-drop nativo do HTML5
// (dragstart/drop) — ele tem seu próprio sensor baseado em mousedown +
// mousemove + mouseup, com um pequeno deslocamento inicial "de disparo" e
// múltiplos mousemove intermediários (senão ele não reconhece como um
// arraste de verdade). Por isso não dá pra usar `.trigger('dragstart')`.
Cypress.Commands.add("arrastarPara", (origemSelector: string, destinoSelector: string) => {
  cy.get(origemSelector).then(($origem) => {
    const origemRect = $origem[0].getBoundingClientRect();
    const origemX = origemRect.left + origemRect.width / 2;
    const origemY = origemRect.top + origemRect.height / 2;

    cy.wrap($origem)
      .trigger("mousedown", { button: 0, clientX: origemX, clientY: origemY, force: true })
      .wait(200)
      .trigger("mousemove", { button: 0, clientX: origemX + 10, clientY: origemY + 10, force: true })
      .wait(200);

    cy.get(destinoSelector).then(($destino) => {
      const destinoRect = $destino[0].getBoundingClientRect();
      const destinoX = destinoRect.left + destinoRect.width / 2;
      const destinoY = destinoRect.top + destinoRect.height / 2;

      // Movimento em vários passos pequenos (em vez de um único salto) —
      // o sensor do dnd recalcula as posições dos droppables a cada
      // mousemove, e um salto grande demais ocasionalmente faz ele perder
      // o destino certo.
      const passos = 5;
      for (let i = 1; i <= passos; i++) {
        const x = origemX + ((destinoX - origemX) * i) / passos;
        const y = origemY + ((destinoY - origemY) * i) / passos;
        cy.wrap($destino).trigger("mousemove", { button: 0, clientX: x, clientY: y, force: true }).wait(100);
      }

      cy.wrap($destino)
        .trigger("mousemove", { button: 0, clientX: destinoX, clientY: destinoY, force: true })
        .wait(300)
        .trigger("mousemove", { button: 0, clientX: destinoX, clientY: destinoY + 5, force: true })
        .wait(300)
        .trigger("mouseup", { force: true })
        .wait(200);
    });
  });
});
