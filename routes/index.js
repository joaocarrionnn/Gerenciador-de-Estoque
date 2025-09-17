const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Importar conexão com banco

// Rota para a dashboard principal
router.get('/', requireAuth, (req, res) => {
    // Buscar estatísticas totais
    const statsQuery = `
        SELECT 
            COUNT(*) as total_produtos,
            SUM(quantidade) as total_estoque,
            SUM(CASE WHEN quantidade <= estoque_minimo THEN 1 ELSE 0 END) as produtos_baixo_estoque,
            SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as produtos_esgotados
        FROM produtos
    `;

    // Buscar últimos produtos
    const productsQuery = 'SELECT * FROM produtos ORDER BY data_criacao DESC LIMIT 5';

    // Buscar estatísticas por categoria
    const categoriesQuery = `
        SELECT 
            tipo,
            COUNT(*) as quantidade,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM produtos), 1) as porcentagem
        FROM produtos 
        GROUP BY tipo 
        ORDER BY quantidade DESC
    `;

    // Executar todas as queries
    db.query(statsQuery, (err, statsResults) => {
        if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return res.render('Home/index', {
                user: req.session.user,
                stats: null,
                produtos: [],
                categorias: [],
                error: 'Erro ao carregar dashboard'
            });
        }

        db.query(productsQuery, (err, productsResults) => {
            if (err) {
                console.error('Erro ao buscar produtos:', err);
                return res.render('Home/index', {
                    user: req.session.user,
                    stats: statsResults[0],
                    produtos: [],
                    categorias: [],
                    error: 'Erro ao carregar produtos'
                });
            }

            db.query(categoriesQuery, (err, categoriesResults) => {
                if (err) {
                    console.error('Erro ao buscar categorias:', err);
                    return res.render('Home/index', {
                        user: req.session.user,
                        stats: statsResults[0],
                        produtos: productsResults,
                        categorias: [],
                        error: 'Erro ao carregar categorias'
                    });
                }

                res.render('Home/index', {
                    user: req.session.user,
                    stats: statsResults[0],
                    produtos: productsResults,
                    categorias: categoriesResults,
                    success: req.query.success,
                    error: req.query.error
                });
            });
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
        // Sempre passar todas as variáveis, mesmo que sejam null
        const renderData = {
            user: req.session.user,
            produtos: [],
            success: null,
            error: null
        };
        
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            renderData.error = 'Erro ao carregar produtos';
        } else {
            renderData.produtos = results;
            renderData.success = req.query.success || null;
            renderData.error = req.query.error || null;
        }
        
        res.render('produtos', renderData);
    });
});

// Rota para exibir o formulário de adição de produtos
router.get('/produtos/adicionar', (req, res) => {
    res.render('adicionar', { 
        user: req.session.user,
        error: null,        // Adicionar estas linhas
        formData: null,     // para garantir que as variáveis existam
        success: null       // mesmo quando não há erro
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
                success: null
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

module.exports = router;

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