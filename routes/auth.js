const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');

router.get("/login", AuthController.login);
router.get("/criar-conta", AuthController.criarConta);
router.post("/criar-conta", AuthController.processarCriarConta);
router.post("/login", AuthController.processarLogin);
router.get("/logout", AuthController.logout);
router.get("/recuperar-senha", AuthController.recuperarSenha);

module.exports = router;