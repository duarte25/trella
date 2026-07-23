declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  interface Chainable<Subject = any> {
    login(email?: string, senha?: string): Chainable<void>;
    limparBoardsDoUsuario(): Chainable<void>;
    criarBoardViaApi(nome: string): Chainable<{ _id: string; nome: string }>;
    arrastarPara(origemSelector: string, destinoSelector: string): Chainable<void>;
  }
}
