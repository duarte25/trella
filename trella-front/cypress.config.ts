import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    env: {
      apiUrl: process.env.CYPRESS_API_URL || "http://localhost:3020",
      loginEmail: "usuario@gmail.com",
      loginSenha: "Dev@1234",
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
