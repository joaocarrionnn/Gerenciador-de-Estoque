const express = require('express');
const router = express.Router();
const PerfilController = require('../controllers/PerfilController');
const upload = require('../config/upload');

router.get('/', PerfilController.perfil);
router.post('/upload-foto', upload.single('profilePhoto'), PerfilController.uploadFoto);
router.post('/atualizar', PerfilController.atualizarPerfil);
router.post('/alterar-senha', PerfilController.alterarSenha);

module.exports = router;