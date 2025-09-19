const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middlewares/authMiddleware');

// Rota para a dashboard principal (versão simplificada)
router.get('/', requireAuth, (req, res) => {
    // Valores padrão
    const defaultStats = {
        total_produtos: 0,
        total_estoque: 0,
        produtos_baixo_estoque: 0,
        produtos_esgotados: 0
    };

    // Buscar últimos produtos
    const productsQuery = 'SELECT * FROM produtos ORDER BY data_criacao DESC LIMIT 5';
    
    db.query(productsQuery, (err, productsResults) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('Home/index', {
                user: req.session.user,
                stats: defaultStats,
                produtos: [],
                categorias: [],
                error: 'Erro ao carregar produtos'
            });
        }

        // Para simplificar, vamos usar valores fixos para as categorias por enquanto
        const categoriesResults = [
            { tipo: 'acido', quantidade: 2, porcentagem: 40 },
            { tipo: 'base', quantidade: 1, porcentagem: 20 },
            { tipo: 'solvente', quantidade: 2, porcentagem: 40 }
        ];

        // Calcular estatísticas básicas
        const stats = {
            total_produtos: productsResults.length,
            total_estoque: productsResults.reduce((sum, product) => sum + (product.quantidade || 0), 0),
            produtos_baixo_estoque: productsResults.filter(product => product.quantidade <= (product.estoque_minimo || 10)).length,
            produtos_esgotados: productsResults.filter(product => product.quantidade === 0).length
        };

        res.render('Home/index', {
            user: req.session.user,
            stats: stats,
            produtos: productsResults,
            categorias: categoriesResults,
            success: req.query.success,
            error: req.query.error
        });
    });
});

router.get('/login', (req, res) => {
    res.render('Auth/login');
});

router.get('/criar_conta', (req, res) => {
    res.render('Auth/criar_conta');
});

// Rota para exibir produtos
router.get('/produtos', (req, res) => {
    const query = 'SELECT * FROM produtos ORDER BY nome';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('produtos', {
                user: req.session.user,
                produtos: [],
                error: 'Erro ao carregar produtos',
                success: null
            });
        }
        
        res.render('produtos', {
            user: req.session.user,
            produtos: results || [],
            success: req.query.success || null,
            error: req.query.error || null
        });
    });
});

// Rota para exibir formulário de adição
router.get('/produtos/adicionar', (req, res) => {
    res.render('adicionar', {
        user: req.session.user,
        formData: null, 
        error: null 
    });
});

// Rota para processar adição de produto
router.post('/produtos/adicionar', (req, res) => {
    const {
        productName,
        productType,
        productDescription,
        dangerLevel,
        regulatoryOrg,
        safetyInstructions,
        stockQuantity,
        minStock,
        unit,
        location,
        availability,
        supplier,
        purchaseDate,
        notes
    } = req.body;

    const query = `
        INSERT INTO produtos 
        (nome, tipo, descricao, grau_periculosidade, orgao_regulador, instrucoes_seguranca, 
         quantidade, estoque_minimo, unidade_medida, localizacao, disponivel, fornecedor, data_aquisicao, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        productName,
        productType,
        productDescription,
        dangerLevel,
        regulatoryOrg,
        safetyInstructions,
        parseInt(stockQuantity),
        minStock ? parseInt(minStock) : 0,
        unit,
        location,
        availability === 'available' ? 1 : 0,
        supplier,
        purchaseDate,
        notes
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao adicionar produto:', err);
            return res.render('adicionar', {
                user: req.session.user,
                error: 'Erro ao adicionar produto',
                formData: req.body,
                success: null  // Adicionar
            });
        }

        res.redirect('/produtos?success=Produto adicionado com sucesso');
    });
});

// Rota para deletar produto
router.post('/produtos/deletar/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM produtos WHERE id_produto = ?';
    
    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Erro ao deletar produto:', err);
            return res.redirect('/produtos?error=Erro ao deletar produto');
        }
        
        res.redirect('/produtos?success=Produto deletado com sucesso');
    });
});

// Rota para exibir formulário de edição
router.get('/produtos/editar/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM produtos WHERE id_produto = ?';
    
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Erro ao buscar produto:', err);
            return res.redirect('/produtos?error=Erro ao carregar produto para edição');
        }
        
        if (results.length === 0) {
            return res.redirect('/produtos?error=Produto não encontrado');
        }
        
        res.render('editar-produto', {
            user: req.session.user,
            produto: results[0],
            error: null
        });
    });
});

// Rota para processar edição de produto
router.post('/produtos/editar/:id', (req, res) => {
    const productId = req.params.id;
    const {
        productName,
        productType,
        productDescription,
        dangerLevel,
        regulatoryOrg,
        safetyInstructions,
        stockQuantity,
        minStock,
        unit,
        location,
        availability,
        supplier,
        purchaseDate,
        notes
    } = req.body;

    const query = `
        UPDATE produtos 
        SET nome = ?, tipo = ?, descricao = ?, grau_periculosidade = ?, orgao_regulador = ?, 
            instrucoes_seguranca = ?, quantidade = ?, estoque_minimo = ?, unidade_medida = ?, 
            localizacao = ?, disponivel = ?, fornecedor = ?, data_aquisicao = ?, observacoes = ?
        WHERE id_produto = ?
    `;

    const values = [
        productName,
        productType,
        productDescription,
        dangerLevel,
        regulatoryOrg,
        safetyInstructions,
        parseInt(stockQuantity),
        minStock ? parseInt(minStock) : 0,
        unit,
        location,
        availability === 'available' ? 1 : 0,
        supplier,
        purchaseDate,
        notes,
        productId
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao editar produto:', err);
            return res.redirect(`/produtos/editar/${productId}?error=Erro ao editar produto`);
        }
        
        res.redirect('/produtos?success=Produto editado com sucesso');
    });
});


// NOVA ROTA PARA SAÍDA DE REAGENTES
router.get('/saida-reagentes', (req, res) => {
    res.render('saida-reagentes', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});

// NOVA ROTA PARA ENTRADA DE REAGENTES
router.get('/entrada-reagentes', (req, res) => {
    res.render('entrada-reagentes', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});

// NOVA ROTA PARA RELATÓRIOS
router.get('/relatorios', (req, res) => {
    res.render('relatorios', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});

// NOVA ROTA PARA LOGOUT
router.get('/logout', (req, res) => {
    res.render('logout', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});
// ROTA CORRIGIDA PARA VIDRAÇARIAS
router.get('/vidracarias', (req, res) => {
    res.render('vidracarias', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});

module.exports = router;