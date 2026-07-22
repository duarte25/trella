declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  interface Chainable<Subject = any> {
    login(email?: string, senha?: string): Chainable<void>;
  }
}
