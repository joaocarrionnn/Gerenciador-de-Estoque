const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Middleware para parsear JSON - ADICIONE ESTE MIDDLEWARE
router.use(express.json());

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Acesso restrito a administradores' 
        });
    }
};

// Rota para buscar usuários (apenas admin)
router.get('/buscar-usuarios', requireAdmin, (req, res) => {
    const query = req.query.q;
    
    console.log('🔍 Buscando usuários com query:', query);
    
    if (!query || query.length < 2) {
        return res.json({ 
            success: true, 
            usuarios: [] 
        });
    }

    const searchQuery = `
        SELECT id_usuario, nome_completo, usuario, email, tipo, turma, data_criacao
        FROM usuarios 
        WHERE (usuario LIKE ? OR email LIKE ? OR nome_completo LIKE ?)
        AND id_usuario != ?
        AND status = 'aprovado'
        ORDER BY 
            CASE WHEN usuario = ? THEN 1 
                 WHEN email = ? THEN 2
                 ELSE 3 END,
            nome_completo
        LIMIT 10
    `;

    const searchTerm = `%${query}%`;
    const currentUserId = req.session.user.id;

    db.query(searchQuery, [
        searchTerm, searchTerm, searchTerm,
        currentUserId, query, query
    ], (err, results) => {
        if (err) {
            console.error('❌ Erro ao buscar usuários:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }

        console.log(`✅ Encontrados ${results.length} usuários`);
        res.json({ 
            success: true, 
            usuarios: results 
        });
    });
});

// Rota para promover/rebaixar usuários (apenas admin)
router.post('/promover-usuario', requireAdmin, (req, res) => {
    console.log('📨 Recebendo requisição para promover usuário');
    console.log('📦 Body recebido:', req.body);
    console.log('📦 Content-Type:', req.get('Content-Type'));

    // Verificar se o body existe
    if (!req.body) {
        console.log('❌ Body está undefined');
        return res.status(400).json({ 
            success: false, 
            message: 'Dados não recebidos' 
        });
    }

    const { userId, novoTipo } = req.body;

    console.log('🔍 Dados extraídos:', { userId, novoTipo });

    // Validações
    if (!userId || !novoTipo) {
        console.log('❌ Dados incompletos:', { userId, novoTipo });
        return res.status(400).json({ 
            success: false, 
            message: 'Dados incompletos. userId e novoTipo são obrigatórios.' 
        });
    }

    if (!['admin', 'usuario'].includes(novoTipo)) {
        console.log('❌ Tipo inválido:', novoTipo);
        return res.status(400).json({ 
            success: false, 
            message: 'Tipo de usuário inválido. Deve ser "admin" ou "usuario".' 
        });
    }

    // Não permitir que o usuário atual modifique a si mesmo
    if (parseInt(userId) === parseInt(req.session.user.id)) {
        console.log('❌ Tentativa de auto-modificação:', userId);
        return res.status(400).json({ 
            success: false, 
            message: 'Você não pode modificar seu próprio tipo de usuário' 
        });
    }

    console.log('💾 Atualizando usuário no banco:', { userId, novoTipo });

    const updateQuery = `
        UPDATE usuarios 
        SET tipo = ?, data_atualizacao = CURRENT_TIMESTAMP 
        WHERE id_usuario = ? AND status = 'aprovado'
    `;

    db.query(updateQuery, [novoTipo, userId], (err, results) => {
        if (err) {
            console.error('❌ Erro ao atualizar tipo de usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }

        console.log('📊 Resultado da atualização:', results);

        if (results.affectedRows === 0) {
            console.log('❌ Usuário não encontrado ou não aprovado');
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado ou não está aprovado' 
            });
        }

        const acao = novoTipo === 'admin' ? 'promovido' : 'rebaixado';
        console.log(`✅ Usuário ${acao} com sucesso!`);
        
        res.json({ 
            success: true, 
            message: `Usuário ${acao} com sucesso!` 
        });
    });
});

module.exports = router;