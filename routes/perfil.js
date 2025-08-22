const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = function(upload) {
    const router = express.Router();
    
    // Rota para exibir o perfil
    router.get('/', (req, res) => {
        res.render('perfil', { 
            title: 'Meu Perfil',
            user: {
                name: 'Usuário',
                email: 'usuario@exemplo.com',
                // Adicione outros dados do usuário aqui
            }
        });
    });
    
    // Rota para upload de foto
    router.post('/upload-foto', upload.single('profilePhoto'), (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
            }
            
            // Aqui você normalmente salvaria a referência da imagem no banco de dados
            const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
            
            res.json({ 
                success: true, 
                message: 'Foto atualizada com sucesso!',
                photoUrl: photoUrl
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ success: false, message: 'Erro ao processar a imagem' });
        }
    });
    
    // Rota para atualizar perfil
    router.post('/atualizar', (req, res) => {
        try {
            const { name, email, bio } = req.body;
            
            // Aqui você atualizaria os dados no banco de dados
            console.log('Dados recebidos para atualização:', req.body);
            
            res.json({ 
                success: true, 
                message: 'Perfil atualizado com sucesso!' 
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
        }
    });
    
    // Rota para alterar senha
    router.post('/alterar-senha', (req, res) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            
            // Validações
            if (newPassword !== confirmPassword) {
                return res.json({ success: false, message: 'As senhas não coincidem' });
            }
            
            if (newPassword.length < 8) {
                return res.json({ success: false, message: 'A senha deve ter pelo menos 8 caracteres' });
            }
            
            // Aqui você verificaria a senha atual e atualizaria no banco de dados
            console.log('Tentativa de alteração de senha');
            
            res.json({ 
                success: true, 
                message: 'Senha alterada com sucesso!' 
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
        }
    });
    
    return router;
};