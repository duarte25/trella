import app from "./src/app"; 
// import swaggerUI from 'swagger-ui-express';
// import swaggerJsDoc from 'swagger-jsdoc';
// import getSwaggerOptions from './src/docs/config/head'; // Assumindo que você tenha um arquivo .ts

// Definir a porta
const port: number = Number(process.env.PORT) || 3020;

// Configuração do Swagger
// const swaggerOptions = getSwaggerOptions();
// app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(swaggerOptions)));

// Inicialização do servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
