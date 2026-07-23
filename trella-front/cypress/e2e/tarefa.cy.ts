describe("Tarefas no Board", () => {
  let board: { _id: string; nome: string };

  beforeEach(() => {
    cy.login();
    cy.limparBoardsDoUsuario();

    const nomeBoard = `[e2e] Board Tarefas ${Date.now()}`;
    cy.criarBoardViaApi(nomeBoard).then((b) => {
      board = b;
      cy.visit(`/informacoes-board/${board._id}`);
    });
  });

  it("cria uma nova tarefa e ela aparece na coluna Open", () => {
    const titulo = `Tarefa Teste ${Date.now()}`;
    const descricao = "Descrição da tarefa de teste criada pelo Cypress.";

    cy.get("[data-cy=nova-tarefa-button]").click();

    cy.get("[data-cy=tarefa-titulo-input]").type(titulo);
    cy.get("[data-cy=tarefa-descricao-input]").type(descricao);

    cy.get("[data-cy=tarefa-responsavel-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();

    cy.get("[data-cy=tarefa-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(titulo).should("be.visible");
      cy.contains(descricao).should("be.visible");
    });
  });

  it("arrasta uma tarefa de Open para Fazendo", () => {
    const titulo = `Tarefa Drag ${Date.now()}`;

    cy.get("[data-cy=nova-tarefa-button]").click();
    cy.get("[data-cy=tarefa-titulo-input]").type(titulo);
    cy.get("[data-cy=tarefa-descricao-input]").type("Tarefa criada para testar o drag and drop.");
    cy.get("[data-cy=tarefa-responsavel-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=tarefa-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(titulo).should("be.visible");
    });

    cy.getCookie("accessToken").then((cookie) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
      }).then((response) => {
        const tarefas: { _id: string; titulo: string }[] = response.body.data.data;
        const tarefa = tarefas.find((t) => t.titulo === titulo);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- `.to.exist` do Chai é um getter, não uma chamada de função
        expect(tarefa, "tarefa recém-criada encontrada via API").to.exist;

        cy.intercept("PATCH", `${Cypress.env("apiUrl")}/tarefas/${tarefa!._id}`).as("moverTarefa");

        cy.arrastarPara(`[data-test=tarefa-${tarefa!._id}]`, "[data-cy=coluna-Fazendo]");

        cy.get("[data-cy=coluna-Fazendo]").within(() => {
          cy.contains(titulo).should("be.visible");
        });
        cy.get("[data-cy=coluna-Open]").within(() => {
          cy.contains(titulo).should("not.exist");
        });

        // Espera o PATCH que persiste o novo status terminar de verdade.
        // A UI atualiza a coluna de forma otimista assim que o drop
        // acontece, ANTES dessa requisição responder sem esperar
        // a checagem no banco logo abaixo pode rodar cedo demais e
        // pegar o status ainda antigo.
        cy.wait("@moverTarefa");

        // A UI move o card de forma otimista antes da resposta da API.
        // Confirma direto no banco que o status realmente persistiu,
        // não só mudou visualmente. (Não existe GET /tarefas/:id na API,
        // por isso busca de novo na listagem.)
        cy.request({
          method: "GET",
          url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
          headers: { Authorization: `Bearer ${cookie?.value}` },
        }).then((tarefasResponse) => {
          const tarefaAtualizada = (tarefasResponse.body.data.data as { _id: string; status: string }[]).find(
            (t) => t._id === tarefa!._id,
          );
          expect(tarefaAtualizada?.status).to.eq("Fazendo");
        });
      });
    });
  });

  it("move uma tarefa por todas as colunas do quadro (Open -> Fazendo -> Feito -> Closed)", () => {
    const titulo = `Tarefa Fluxo ${Date.now()}`;

    cy.get("[data-cy=nova-tarefa-button]").click();
    cy.get("[data-cy=tarefa-titulo-input]").type(titulo);
    cy.get("[data-cy=tarefa-descricao-input]").type("Tarefa criada para testar o fluxo completo de colunas.");
    cy.get("[data-cy=tarefa-responsavel-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=tarefa-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(titulo).should("be.visible");
    });

    cy.getCookie("accessToken").then((cookie) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
      }).then((response) => {
        const tarefas: { _id: string; titulo: string }[] = response.body.data.data;
        const tarefa = tarefas.find((t) => t.titulo === titulo);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- `.to.exist` do Chai é um getter, não uma chamada de função
        expect(tarefa, "tarefa recém-criada encontrada via API").to.exist;
        const taskId = tarefa!._id;

        // Passa a tarefa por cada coluna, uma de cada vez, confirmando
        // visual (some da origem, aparece no destino) e no banco (status
        // realmente persistiu) a cada passo antes de seguir pro próximo.
        const etapas = [
          { origem: "Open", destino: "Fazendo" },
          { origem: "Fazendo", destino: "Feito" },
          { origem: "Feito", destino: "Closed" },
        ];

        etapas.forEach(({ origem, destino }) => {
          cy.intercept("PATCH", `${Cypress.env("apiUrl")}/tarefas/${taskId}`).as(`mover-${destino}`);

          cy.arrastarPara(`[data-test=tarefa-${taskId}]`, `[data-cy=coluna-${destino}]`);

          cy.get(`[data-cy=coluna-${destino}]`).within(() => {
            cy.contains(titulo).should("be.visible");
          });
          cy.get(`[data-cy=coluna-${origem}]`).within(() => {
            cy.contains(titulo).should("not.exist");
          });

          cy.wait(`@mover-${destino}`);

          cy.request({
            method: "GET",
            url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
            headers: { Authorization: `Bearer ${cookie?.value}` },
          }).then((tarefasResponse) => {
            const tarefaAtualizada = (tarefasResponse.body.data.data as { _id: string; status: string }[]).find(
              (t) => t._id === taskId,
            );
            expect(tarefaAtualizada?.status, `status após mover pra ${destino}`).to.eq(destino);
          });
        });
      });
    });
  });

  it("edita o título de uma tarefa existente", () => {
    const tituloOriginal = `Tarefa Original ${Date.now()}`;
    const tituloEditado = `Tarefa Editada ${Date.now()}`;

    cy.get("[data-cy=nova-tarefa-button]").click();
    cy.get("[data-cy=tarefa-titulo-input]").type(tituloOriginal);
    cy.get("[data-cy=tarefa-descricao-input]").type("Descrição original.");
    cy.get("[data-cy=tarefa-responsavel-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=tarefa-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(tituloOriginal).should("be.visible");
    });

    cy.get("[data-cy=tarefa-menu-acoes-trigger]").click();
    cy.get("[data-cy=tarefa-editar-item]").click();

    // Fechar o menu "..." (que tenta devolver o foco pro botão) e abrir o
    // diálogo (que tenta focar o input) ao mesmo tempo cria uma corrida de
    // foco assíncrona no Radix  mesmo esperando `be.focused`, o foco podia
    // "piscar" de volta um instante depois, engolindo os primeiros
    // caracteres digitados (ex: "Tarefa" virava "arefa" ou até "egundo").
    // Um wait fixo dá tempo dessa troca de foco terminar de vez antes de
    // interagir com o input.
    cy.get("[data-cy=tarefa-edit-titulo-input]").should("have.value", tituloOriginal);
    cy.wait(300);
    cy.get("[data-cy=tarefa-edit-titulo-input]").clear().type(tituloEditado);
    cy.get("[data-cy=tarefa-edit-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(tituloEditado).should("be.visible");
      cy.contains(tituloOriginal).should("not.exist");
    });

    // A UI atualiza de forma otimista só depois que o handleEditTask chama
    // a mutation confirma no banco que o novo título realmente persistiu.
    cy.getCookie("accessToken").then((cookie) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
      }).then((response) => {
        const tarefas: { titulo: string }[] = response.body.data.data;
        expect(tarefas.some((t) => t.titulo === tituloEditado)).to.eq(true);
        expect(tarefas.some((t) => t.titulo === tituloOriginal)).to.eq(false);
      });
    });
  });

  it("deleta uma tarefa pelo menu de ações", () => {
    const titulo = `Tarefa Deletar ${Date.now()}`;

    cy.get("[data-cy=nova-tarefa-button]").click();
    cy.get("[data-cy=tarefa-titulo-input]").type(titulo);
    cy.get("[data-cy=tarefa-descricao-input]").type("Tarefa que vai ser deletada.");
    cy.get("[data-cy=tarefa-responsavel-combobox]").click();
    cy.get("[data-cy=combobox-option]").first().click();
    cy.get("[data-cy=tarefa-submit-button]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(titulo).should("be.visible");
    });

    cy.get("[data-cy=tarefa-menu-acoes-trigger]").click();
    cy.get("[data-cy=tarefa-deletar-item]").click();

    cy.get("[data-cy=coluna-Open]").within(() => {
      cy.contains(titulo).should("not.exist");
    });

    // Confirma que a tarefa sumiu de verdade no banco, não só na tela.
    cy.getCookie("accessToken").then((cookie) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/tarefas?board_id=${board._id}`,
        headers: { Authorization: `Bearer ${cookie?.value}` },
      }).then((response) => {
        const tarefas: { titulo: string }[] = response.body.data.data;
        expect(tarefas.some((t) => t.titulo === titulo)).to.eq(false);
      });
    });
  });
});
