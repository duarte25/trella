import "./commands";

// "ResizeObserver loop completed with undelivered notifications" é um aviso
// benigno do navegador (não um bug real), comum durante reflows rápidos
// exatamente o que acontece no drag-and-drop do @hello-pangea/dnd. Por
// padrão o Cypress falha o teste em QUALQUER erro não tratado da aplicação;
// sem isto, os testes de arrastar tarefa ficam aleatoriamente instáveis.
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("ResizeObserver loop")) {
    return false;
  }
});
