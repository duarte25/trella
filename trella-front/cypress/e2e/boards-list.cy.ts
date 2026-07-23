// Prefixo só pra deixar claro, olhando a tela ou o banco, o que foi criado
// pelos testes mas a limpeza abaixo NÃO depende dele (ver comentário no
// beforeEach).
const E2E_PREFIX = "[e2e]";

describe("Lista de Boards", () => {
  const boardsCriadosIds: string[] = [];

  function limparTodosOsBoardsDoUsuario() {
    return cy.getCookie("accessToken").then((cookie) => {
      const token = cookie?.value;

      return cy
        .request({
          method: "GET",
          url: `${Cypress.env("apiUrl")}/boards?limite=200`,
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
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
  }

  beforeEach(() => {
    cy.login();
    // Limpeza defensiva: apaga TODOS os boards do usuário fixo antes de
    // cada teste não só os com prefixo "[e2e]". Motivos:
    // 1) o boardSeed.ts sorteia aleatoriamente quem é responsável/membro de
    //    cada board, então o usuário de teste pode "ganhar" boards do seed
    // 2) uma rodada anterior interrompida (ex: fechou o Cypress no meio)
    //    pode ter deixado boards de teste órfãos.
    // Isso só é seguro porque este banco é o de teste, isolado.
    limparTodosOsBoardsDoUsuario();
  });

  afterEach(() => {
    cy.getCookie("accessToken").then((cookie) => {
      if (!cookie) return;

      boardsCriadosIds.forEach((id) => {
        cy.request({
          method: "DELETE",
          url: `${Cypress.env("apiUrl")}/boards/${id}`,
          headers: { Authorization: `Bearer ${cookie.value}` },
          failOnStatusCode: false,
        });
      });
      boardsCriadosIds.length = 0;
    });
  });

  function criarBoardViaApi(nome: string) {
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
            .then((createResponse) => {
              const board = createResponse.body.data;
              boardsCriadosIds.push(board._id);
              return board;
            });
        });
    });
  }

  it("lista os boards do usuário logado na home", () => {
    const nomeBoard = `${E2E_PREFIX} Board Lista ${Date.now()}`;

    criarBoardViaApi(nomeBoard).then(() => {
      cy.visit("/home");

      cy.get("[data-test=tabela-boards]").should("be.visible");
      cy.contains("[data-test=coluna-nome]", "Nome").should("be.visible");
      cy.contains("[data-test=coluna-responsavel]", "Responsável").should("be.visible");

      cy.contains("[data-test=celula-nome]", nomeBoard).should("be.visible");
      cy.contains("[data-test=celula-responsavel]", "Usuario").should("be.visible");
      cy.contains("[data-test=total-documentos]", "Total:").should("be.visible");
    });
  });

  it("exibe estado vazio quando o usuário não tem boards", () => {
    cy.visit("/home");

    cy.get("[data-test=tabela-boards]").should("be.visible");
    cy.get("[data-test^=linha-board-]").should("not.exist");
  });

  it("acessa as informações de uma board pelo ícone de olho", () => {
    const nomeBoard = `${E2E_PREFIX} Board Lista ${Date.now()}`;

    criarBoardViaApi(nomeBoard).then((board) => {
      cy.visit("/home");

      cy.contains("[data-test=celula-nome]", nomeBoard)
        .parents(`[data-test=linha-board-${board._id}]`)
        .find("[data-test=link-informacoes]")
        .click();

      cy.url().should("include", `/informacoes-board/${board._id}`);
    });
  });

  describe("Paginação", () => {
    beforeEach(() => {
      const prefixo = `${E2E_PREFIX} Board Pag ${Date.now()}`;
      for (let i = 1; i <= 11; i++) {
        criarBoardViaApi(`${prefixo} ${String(i).padStart(2, "0")}`);
      }
      cy.visit("/home");
    });

    it("mostra 10 boards por página e a paginação com 2 páginas", () => {
      cy.contains("[data-test=total-documentos]", "Total: 11").should("be.visible");
      cy.get("[data-test^=linha-board-]").should("have.length", 10);

      cy.get("[data-test=pagina-1]").should("be.visible").and("have.attr", "aria-current", "page");
      cy.get("[data-test=pagina-2]").should("be.visible");
    });

    it("navega para a segunda página pelo número da página", () => {
      cy.get("[data-test=pagina-2]").click();

      cy.get("[data-test^=linha-board-]").should("have.length", 1);
      cy.get("[data-test=pagina-2]").should("have.attr", "aria-current", "page");
    });

    it("navega usando o botão de próxima e anterior", () => {
      cy.get("[data-test=button-pagina-anterior]").should("have.attr", "aria-disabled", "true");

      cy.get("[data-test=button-proxima-pagina]").click();
      cy.get("[data-test^=linha-board-]").should("have.length", 1);
      cy.get("[data-test=button-proxima-pagina]").should("have.attr", "aria-disabled", "true");

      cy.get("[data-test=button-pagina-anterior]").click();
      cy.get("[data-test^=linha-board-]").should("have.length", 10);
    });
  });

  it("deleta uma board pelo menu de ações", () => {
    const nomeBoard = `${E2E_PREFIX} Board Lista ${Date.now()}`;

    criarBoardViaApi(nomeBoard).then((board) => {
      cy.visit("/home");

      cy.contains("[data-test=celula-nome]", nomeBoard).should("be.visible");

      cy.get(`[data-test=linha-board-${board._id}] [data-cy=board-menu-acoes-trigger]`).click();
      cy.contains("Deletar Board").click();
      cy.contains("Tem certeza?").should("be.visible");
      cy.contains("button", "Sim, deletar").click();

      cy.contains("[data-test=celula-nome]", nomeBoard).should("not.exist");
    });
  });
});
