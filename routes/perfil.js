const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const { uploadProfile } = require('../config/upload'); // ← CORREÇÃO AQUI

router.get('/', PerfilController.perfil);
router.post('/upload-foto', uploadProfile.single('profilePhoto'), PerfilController.uploadFoto); // ← E AQUI
router.post('/atualizar', PerfilController.atualizarPerfil);
router.post('/alterar-senha', PerfilController.alterarSenha);

module.exports = router;