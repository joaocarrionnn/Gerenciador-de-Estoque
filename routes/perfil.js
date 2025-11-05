const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const { uploadProfile } = require('../config/upload');

//  CORREÇÃO: Usar uploadProfile.single() corretamente 
router.get('/', PerfilController.perfil);
router.post('/upload-foto', uploadProfile.single('profilePhoto'), PerfilController.uploadFoto);
router.post('/atualizar', PerfilController.atualizarPerfil);
router.post('/alterar-senha', PerfilController.alterarSenha);

module.exports = router;