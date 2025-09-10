const PerfilModel = require('../models/PerfilModel');

class PerfilController {
    // Exibir perfil
    static async perfil(req, res) {
        try {
            // Simulação de dados do usuário (substitua pela lógica real)
            const userData = {
                name: 'Usuário',
                email: 'usuario@exemplo.com'
            };
            
            res.render('perfil', { 
                title: 'Meu Perfil',
                user: userData
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            res.render('perfil', { error: 'Erro ao carregar perfil' });
        }
    }

    // Upload de foto
    static async uploadFoto(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada' });
            }
            
            const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
            
            // Aqui você salvaria a URL no banco usando PerfilModel
            res.json({ 
                success: true, 
                message: 'Foto atualizada com sucesso!',
                photoUrl: photoUrl
            });
        } catch (error) {
            console.error('Erro no upload:', error);
            res.status(500).json({ success: false, message: 'Erro ao processar a imagem' });
        }
    }

    // Atualizar perfil
    static async atualizarPerfil(req, res) {
        try {
            const { name, email, bio } = req.body;
            
            console.log('Dados recebidos para atualização:', req.body);
            
            res.json({ 
                success: true, 
                message: 'Perfil atualizado com sucesso!' 
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ success: false, message: 'Erro ao atualizar perfil' });
        }
    }

    // Alterar senha
    static async alterarSenha(req, res) {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            
            if (newPassword !== confirmPassword) {
                return res.json({ success: false, message: 'As senhas não coincidem' });
            }
            
            if (newPassword.length < 8) {
                return res.json({ success: false, message: 'A senha deve ter pelo menos 8 caracteres' });
            }
            
            console.log('Tentativa de alteração de senha');
            
            res.json({ 
                success: true, 
                message: 'Senha alterada com sucesso!' 
            });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ success: false, message: 'Erro ao alterar senha' });
        }
    }
}

module.exports = PerfilController;