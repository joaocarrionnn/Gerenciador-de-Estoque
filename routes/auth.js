
const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rotas GET
router.get("/login", AuthController.login);
router.get("/criar-conta", AuthController.criarConta);
router.get("/recuperar-senha", AuthController.recuperarSenha);
router.get("/logout", AuthController.logout);

// Rotas POST
router.post("/criar-conta", AuthController.processarCriarConta);
router.post("/login", AuthController.processarLogin);
router.post("/verificar-identidade", AuthController.processarVerificacaoIdentidade);
router.post("/redefinir-senha", AuthController.processarRedefinicaoSenha);

module.exports = router;