const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.get("/login", AuthController.login);
router.get("/criar-conta", AuthController.criarConta);
router.post("/criar-conta", AuthController.processarCriarConta); // Alterado para processar criação
router.post("/login", AuthController.processarLogin);
router.get("/logout", AuthController.logout);

// Novas rotas para recuperação de senha
router.get("/recuperar-senha", AuthController.recuperarSenha);
router.post("/recuperar-senha", AuthController.processarRecuperarSenha);

module.exports = router;