const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middlewares/authMiddleware');


// Rota para a dashboard principal (VERSÃO ATUALIZADA - 4 MAIS USADOS)
router.get('/', requireAuth, (req, res) => {
    // Buscar últimos produtos
    const productsQuery = 'SELECT * FROM produtos ORDER BY data_criacao DESC LIMIT 5';
    
    db.query(productsQuery, (err, productsResults) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('Home/index', {
                user: req.session.user,
                stats: {},
                produtos: [],
                categorias: [],
                error: 'Erro ao carregar produtos'
            });
        }

        // Buscar os 4 tipos de reagentes mais usados (com base na quantidade total)
        const categoriesQuery = `
            SELECT 
                tipo,
                COUNT(*) as quantidade,
                SUM(quantidade) as total_quantidade,
                ROUND((SUM(quantidade) * 100.0 / (SELECT SUM(quantidade) FROM produtos)), 1) as porcentagem
            FROM produtos 
            WHERE quantidade > 0
            GROUP BY tipo 
            ORDER BY total_quantidade DESC, quantidade DESC
            LIMIT 4
        `;

        db.query(categoriesQuery, (err, categoriesResults) => {
            if (err) {
                console.error('Erro ao buscar categorias:', err);
                // Buscar categorias alternativas (apenas contagem)
                const fallbackQuery = `
                    SELECT 
                        tipo,
                        COUNT(*) as quantidade,
                        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM produtos)), 1) as porcentagem
                    FROM produtos 
                    GROUP BY tipo 
                    ORDER BY quantidade DESC
                    LIMIT 4
                `;

                db.query(fallbackQuery, (err, fallbackResults) => {
                    if (err) {
                        console.error('Erro ao buscar categorias alternativas:', err);
                        const defaultCategories = [
                            { tipo: 'Ácidos', quantidade: 0, porcentagem: 0 },
                            { tipo: 'Bases', quantidade: 0, porcentagem: 0 },
                            { tipo: 'Solventes', quantidade: 0, porcentagem: 0 },
                            { tipo: 'Sais', quantidade: 0, porcentagem: 0 }
                        ];
                        
                        const stats = {
                            total_produtos: productsResults.length,
                            total_estoque: productsResults.reduce((sum, product) => sum + (product.quantidade || 0), 0),
                            produtos_baixo_estoque: productsResults.filter(product => product.quantidade <= (product.estoque_minimo || 10)).length,
                            produtos_esgotados: productsResults.filter(product => product.quantidade === 0).length
                        };

                        return res.render('Home/index', {
                            user: req.session.user,
                            stats: stats,
                            produtos: productsResults,
                            categorias: defaultCategories,
                            success: req.query.success,
                            error: req.query.error
                        });
                    }

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
                        categorias: fallbackResults,
                        success: req.query.success,
                        error: req.query.error
                    });
                });
                return;
            }

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
});

router.get('/login', (req, res) => {
    res.render('Auth/login');
});

router.get('/criar_conta', (req, res) => {
    res.render('Auth/criar_conta');
});

// Rota para exibir produtos (com suporte a pesquisa avançada)
router.get('/produtos', (req, res) => {
    const {
        search,
        searchType = 'all',
        category,
        status,
        dateFilter,
        dangerLevel,
        quantityFilter,
        supplier,
        regulatoryOrg
    } = req.query;

    let query = 'SELECT * FROM produtos WHERE 1=1';
    let queryParams = [];

    // Filtro por termo de pesquisa
    if (search) {
        const searchPattern = `%${search}%`;
        switch (searchType) {
            case 'name':
                query += ' AND nome LIKE ?';
                queryParams.push(searchPattern);
                break;
            case 'id':
                query += ' AND id_produto LIKE ?';
                queryParams.push(searchPattern);
                break;
            case 'category':
                query += ' AND tipo LIKE ?';
                queryParams.push(searchPattern);
                break;
            case 'supplier':
                query += ' AND fornecedor LIKE ?';
                queryParams.push(searchPattern);
                break;
            case 'location':
                query += ' AND localizacao LIKE ?';
                queryParams.push(searchPattern);
                break;
            default: // 'all'
                query += ' AND (id_produto LIKE ? OR nome LIKE ? OR tipo LIKE ? OR descricao LIKE ? OR fornecedor LIKE ? OR localizacao LIKE ?)';
                queryParams.push(...Array(6).fill(searchPattern));
                break;
        }
    }

    // Filtro por categoria
    if (category) {
        query += ' AND tipo = ?';
        queryParams.push(category);
    }

    // Filtro por status
    if (status) {
        switch (status) {
            case 'available':
                query += ' AND disponivel = 1 AND quantidade > 0';
                break;
            case 'low_stock':
                query += ' AND quantidade > 0 AND quantidade <= estoque_minimo';
                break;
            case 'out_of_stock':
                query += ' AND quantidade = 0';
                break;
        }
    }

    // Filtro por data
    if (dateFilter) {
        const now = new Date();
        switch (dateFilter) {
            case 'today':
                query += ' AND DATE(data_aquisicao) = CURDATE()';
                break;
            case 'week':
                query += ' AND YEARWEEK(data_aquisicao, 1) = YEARWEEK(CURDATE(), 1)';
                break;
            case 'month':
                query += ' AND YEAR(data_aquisicao) = YEAR(CURDATE()) AND MONTH(data_aquisicao) = MONTH(CURDATE())';
                break;
            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                query += ' AND data_aquisicao >= ? AND data_aquisicao < ?';
                queryParams.push(lastMonth.toISOString().split('T')[0]);
                queryParams.push(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
                break;
            case 'year':
                query += ' AND YEAR(data_aquisicao) = YEAR(CURDATE())';
                break;
        }
    }

    // Filtro por periculosidade
    if (dangerLevel) {
        query += ' AND grau_periculosidade = ?';
        queryParams.push(dangerLevel);
    }

    // Filtro por quantidade
    if (quantityFilter) {
        switch (quantityFilter) {
            case 'zero':
                query += ' AND quantidade = 0';
                break;
            case 'low':
                query += ' AND quantidade > 0 AND quantidade <= estoque_minimo';
                break;
            case 'normal':
                query += ' AND quantidade > estoque_minimo';
                break;
        }
    }

    // Filtro por fornecedor
    if (supplier) {
        query += ' AND fornecedor = ?';
        queryParams.push(supplier);
    }

    // Filtro por órgão regulador
    if (regulatoryOrg) {
        query += ' AND orgao_regulador = ?';
        queryParams.push(regulatoryOrg);
    }

    query += ' ORDER BY nome';
    
    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('produtos', {
                user: req.session.user,
                produtos: [],
                error: 'Erro ao carregar produtos',
                success: null,
                searchTerm: search || '',
                searchType: searchType,
                selectedCategory: category || '',
                status: status || '',
                dateFilter: dateFilter || '',
                dangerLevel: dangerLevel || '',
                quantityFilter: quantityFilter || '',
                supplier: supplier || '',
                regulatoryOrg: regulatoryOrg || ''
            });
        }
        
        res.render('produtos', {
            user: req.session.user,
            produtos: results || [],
            success: req.query.success || null,
            error: req.query.error || null,
            searchTerm: search || '',
            searchType: searchType,
            selectedCategory: category || '',
            status: status || '',
            dateFilter: dateFilter || '',
            dangerLevel: dangerLevel || '',
            quantityFilter: quantityFilter || '',
            supplier: supplier || '',
            regulatoryOrg: regulatoryOrg || ''
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

// ROTA PARA SAÍDA DE REAGENTES
router.get('/saida-reagentes', requireAuth, (req, res) => {
    // Buscar produtos disponíveis do banco
    const produtosQuery = `
        SELECT 
            id_produto, 
            nome, 
            quantidade, 
            unidade_medida,
            tipo,
            descricao,
            grau_periculosidade,
            localizacao
        FROM produtos 
        WHERE disponivel = 1 
        ORDER BY nome
    `;
    
    db.query(produtosQuery, (err, produtosResults) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('saida-reagentes', {
                user: req.session.user,
                produtos: [],
                error: 'Erro ao carregar produtos do banco de dados'
            });
        }

        res.render('saida-reagentes', {
            user: req.session.user,
            produtos: produtosResults || [],
            success: req.query.success,
            error: req.query.error
        });
    });
});

// API PARA REGISTRAR SAÍDA DE REAGENTE (VERSÃO COM PROMISES)
router.post('/api/output', requireAuth, (req, res) => {
    const { reagent, quantity, responsible, project, notes } = req.body;
    
    console.log('📤 Registrando saída:', { reagent, quantity, responsible });

    // Validações
    if (!reagent || !quantity || !responsible) {
        return res.json({
            success: false,
            message: '❌ Reagente, quantidade e responsável são obrigatórios'
        });
    }

    const quantidadeSaida = parseFloat(quantity);
    if (isNaN(quantidadeSaida) || quantidadeSaida <= 0) {
        return res.json({
            success: false,
            message: '❌ Quantidade deve ser um número positivo'
        });
    }

    // Função para executar queries com Promise
    const query = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    };

    // Executar o processo
    (async () => {
        try {
            // 1. Buscar produto
            const produtoResults = await query(
                'SELECT id_produto, nome, quantidade, unidade_medida, estoque_minimo FROM produtos WHERE id_produto = ?',
                [reagent]
            );

            if (produtoResults.length === 0) {
                return res.json({
                    success: false,
                    message: '❌ Produto não encontrado'
                });
            }

            const produto = produtoResults[0];
            const quantidadeAtual = parseFloat(produto.quantidade);

            // Verificar estoque
            if (quantidadeAtual < quantidadeSaida) {
                return res.json({
                    success: false,
                    message: `❌ Estoque insuficiente! Disponível: ${quantidadeAtual} ${produto.unidade_medida}`
                });
            }

            const novaQuantidade = quantidadeAtual - quantidadeSaida;

            // 2. Atualizar estoque
            await query(
                'UPDATE produtos SET quantidade = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_produto = ?',
                [novaQuantidade, reagent]
            );

            console.log('✅ Estoque atualizado com sucesso');

            // 3. Tentar registrar movimentação
            try {
                await query(
                    `INSERT INTO movimentacoes 
                    (id_produto, tipo, quantidade, unidade_medida, responsavel, projeto_experimento, observacoes)
                    VALUES (?, 'saida', ?, ?, ?, ?, ?)`,
                    [
                        reagent,
                        quantidadeSaida,
                        produto.unidade_medida,
                        responsible,
                        project,
                        notes || `Saída registrada por ${responsible}`
                    ]
                );
                console.log('✅ Movimentação registrada com sucesso');
            } catch (movimentacaoError) {
                console.log('ℹ️ Tabela movimentacoes não existe ou erro ao inserir:', movimentacaoError.message);
                // Continua mesmo sem a tabela de movimentações
            }

            console.log('✅ Saída registrada com sucesso para o produto:', produto.nome);
            
            res.json({
                success: true,
                message: `✅ Saída de ${quantidadeSaida} ${produto.unidade_medida} de ${produto.nome} registrada com sucesso!`,
                data: {
                    produto: produto.nome,
                    quantidade: quantidadeSaida,
                    unidade: produto.unidade_medida,
                    estoque_atual: novaQuantidade,
                    responsavel: responsible
                }
            });

        } catch (error) {
            console.error('Erro no processo de saída:', error);
            res.json({
                success: false,
                message: '❌ Erro interno do servidor: ' + error.message
            });
        }
    })();
});


// API PARA MOVIMENTAÇÕES
router.get('/api/movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_estoque' 
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || result[0].table_exists === 0) {
            return res.json(mockData);
        }

        // Buscar dados reais
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            WHERE m.tipo = 'saida'
            ORDER BY m.data_movimentacao DESC
            LIMIT 10
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações:', err);
                return res.json([]);
            }
            res.json(results);
        });
    });
});


// API PARA MOVIMENTAÇÕES DE SAÍDA (ESPECÍFICA)
router.get('/api/output-movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_estoque' 
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || result[0].table_exists === 0) {
            return res.json(mockData);
        }

        // Buscar dados reais - APENAS SAÍDAS e limitado a 4
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            WHERE m.tipo = 'saida'
            ORDER BY m.data_movimentacao DESC
            LIMIT 4
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações de saída:', err);
                return res.json([]);
            }
            res.json(results);
        });
    });
});

// API PARA MOVIMENTAÇÕES DE ENTRADA
router.get('/api/input-movements', requireAuth, (req, res) => {
    const query = `
        SELECT 
            m.id_movimentacao as id,
            p.nome as reagent,
            m.tipo as type,
            m.quantidade as quantity,
            m.unidade_medida as unit,
            m.responsavel as responsible,
            m.projeto_experimento as project,
            m.data_movimentacao as date
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        WHERE m.tipo = 'entrada'
        ORDER BY m.data_movimentacao DESC
        LIMIT 4
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar movimentações de entrada:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }
        res.json(results);
    });
});

// API PARA ESTATÍSTICAS
router.get('/api/statistics', requireAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar tabela movimentacoes
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_estoque' 
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        const tableExists = !err && result[0].table_exists > 0;

        // Buscar total de produtos
        const totalQuery = 'SELECT COUNT(*) as count FROM produtos WHERE disponivel = 1';
        
        db.query(totalQuery, (err, totalResults) => {
            const totalItems = totalResults[0]?.count || 0;

            if (!tableExists) {
                // Estatísticas mockadas
                return res.json({
                    todayOutputs: 8,
                    weekOutputs: 42,
                    monthOutputs: 156,
                    totalItems: totalItems,
                    mostUsedReagents: [
                        { name: 'Ácido Clorídrico P.A.', percentage: 32 },
                        { name: 'Hidróxido de Sódio P.A.', percentage: 27 },
                        { name: 'Sulfato de Cobre II', percentage: 18 }
                    ]
                });
            }

            // Buscar estatísticas 
            const todayQuery = `
                SELECT COUNT(*) as count 
                FROM movimentacoes 
                WHERE tipo = 'saida' AND DATE(data_movimentacao) = ?
            `;

            const weekQuery = `
                SELECT COUNT(*) as count 
                FROM movimentacoes 
                WHERE tipo = 'saida' 
                AND YEARWEEK(data_movimentacao, 1) = YEARWEEK(CURDATE(), 1)
            `;

            const monthQuery = `
                SELECT COUNT(*) as count 
                FROM movimentacoes 
                WHERE tipo = 'saida' 
                AND YEAR(data_movimentacao) = YEAR(CURDATE()) 
                AND MONTH(data_movimentacao) = MONTH(CURDATE())
            `;

            const reagentsQuery = `
                SELECT 
                    p.nome as name,
                    ROUND((COUNT(m.id_movimentacao) / (SELECT COUNT(*) FROM movimentacoes WHERE tipo = 'saida') * 100), 1) as percentage
                FROM movimentacoes m
                JOIN produtos p ON m.id_produto = p.id_produto
                WHERE m.tipo = 'saida'
                GROUP BY p.id_produto, p.nome
                ORDER BY percentage DESC
                LIMIT 3
            `;

            // Executar queries
            Promise.all([
                new Promise(resolve => 
                    db.query(todayQuery, [today], (err, res) => 
                        resolve(err ? 0 : res[0].count)
                    )
                ),
                new Promise(resolve => 
                    db.query(weekQuery, (err, res) => 
                        resolve(err ? 0 : res[0].count)
                    )
                ),
                new Promise(resolve => 
                    db.query(monthQuery, (err, res) => 
                        resolve(err ? 0 : res[0].count)
                    )
                ),
                new Promise(resolve => 
                    db.query(reagentsQuery, (err, res) => 
                        resolve(err ? [] : res)
                    )
                )
            ]).then(([todayOutputs, weekOutputs, monthOutputs, mostUsedReagents]) => {
                res.json({
                    todayOutputs,
                    weekOutputs,
                    monthOutputs,
                    totalItems,
                    mostUsedReagents: mostUsedReagents.length > 0 ? mostUsedReagents : [
                        { name: 'Ácido Clorídrico P.A.', percentage: 32 },
                        { name: 'Hidróxido de Sódio P.A.', percentage: 27 },
                        { name: 'Sulfato de Cobre II', percentage: 18 }
                    ]
                });
            }).catch(error => {
                console.error('Erro nas estatísticas:', error);
                res.json({
                    todayOutputs: 0,
                    weekOutputs: 0,
                    monthOutputs: 0,
                    totalItems: totalItems,
                    mostUsedReagents: []
                });
            });
        });
    });
});

// ROTA PARA ENTRADA DE REAGENTES
router.get('/entrada-reagentes', requireAuth, (req, res) => {
    // Buscar todos os produtos para o dropdown
    const produtosQuery = `
        SELECT 
            id_produto, 
            nome, 
            quantidade, 
            unidade_medida,
            tipo,
            localizacao
        FROM produtos 
        ORDER BY nome
    `;
    
    db.query(produtosQuery, (err, produtosResults) => {
        if (err) {
            console.error('Erro ao buscar produtos:', err);
            return res.render('entrada-reagentes', {
                user: req.session.user,
                produtos: [],
                error: 'Erro ao carregar produtos do banco de dados'
            });
        }

        res.render('entrada-reagentes', {
            user: req.session.user,
            produtos: produtosResults || [],
            success: req.query.success,
            error: req.query.error
        });
    });
});

// API PARA REGISTRAR ENTRADA DE REAGENTE
router.post('/api/input', requireAuth, (req, res) => {
    const { reagent, quantity, responsible, supplier, purchaseDate, notes } = req.body;
    
    console.log('📥 Registrando entrada:', { reagent, quantity, responsible, supplier });

    // Validações
    if (!reagent || !quantity || !responsible) {
        return res.json({
            success: false,
            message: '❌ Reagente, quantidade e responsável são obrigatórios'
        });
    }

    const quantidadeEntrada = parseFloat(quantity);
    if (isNaN(quantidadeEntrada) || quantidadeEntrada <= 0) {
        return res.json({
            success: false,
            message: '❌ Quantidade deve ser um número positivo'
        });
    }

    // Função para executar queries com Promise
    const query = (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    };

    // Executar o processo
    (async () => {
        try {
            // 1. Buscar produto
            const produtoResults = await query(
                'SELECT id_produto, nome, quantidade, unidade_medida FROM produtos WHERE id_produto = ?',
                [reagent]
            );

            if (produtoResults.length === 0) {
                return res.json({
                    success: false,
                    message: '❌ Produto não encontrado'
                });
            }

            const produto = produtoResults[0];
            const quantidadeAtual = parseFloat(produto.quantidade);
            const novaQuantidade = quantidadeAtual + quantidadeEntrada;

            // 2. Atualizar estoque
            await query(
                'UPDATE produtos SET quantidade = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_produto = ?',
                [novaQuantidade, reagent]
            );

            console.log('✅ Estoque atualizado com sucesso');

            // 3. Tentar registrar movimentação de entrada
            try {
                await query(
                    `INSERT INTO movimentacoes 
                    (id_produto, tipo, quantidade, unidade_medida, responsavel, projeto_experimento, observacoes)
                    VALUES (?, 'entrada', ?, ?, ?, ?, ?)`,
                    [
                        reagent,
                        quantidadeEntrada,
                        produto.unidade_medida,
                        responsible,
                        supplier ? `Fornecedor: ${supplier}` : null,
                        notes || `Entrada registrada por ${responsible}. ${purchaseDate ? `Data de compra: ${purchaseDate}` : ''}`
                    ]
                );
                console.log('✅ Movimentação de entrada registrada com sucesso');
            } catch (movimentacaoError) {
                console.log('ℹ️ Tabela movimentacoes não existe ou erro ao inserir:', movimentacaoError.message);
                // Continua mesmo sem a tabela de movimentações
            }

            console.log('✅ Entrada registrada com sucesso para o produto:', produto.nome);
            
            res.json({
                success: true,
                message: `✅ Entrada de ${quantidadeEntrada} ${produto.unidade_medida} de ${produto.nome} registrada com sucesso!`,
                data: {
                    produto: produto.nome,
                    quantidade: quantidadeEntrada,
                    unidade: produto.unidade_medida,
                    estoque_atual: novaQuantidade,
                    responsavel: responsible,
                    fornecedor: supplier
                }
            });

        } catch (error) {
            console.error('Erro no processo de entrada:', error);
            res.json({
                success: false,
                message: '❌ Erro interno do servidor: ' + error.message
            });
        }
    })();
});

// API PARA MOVIMENTAÇÕES DE ENTRADA
router.get('/api/input-movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_estoque' 
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || result[0].table_exists === 0) {
            return res.json(mockData);
        }

        // Buscar dados reais de entrada
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            WHERE m.tipo = 'entrada'
            ORDER BY m.data_movimentacao DESC
            LIMIT 10
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações de entrada:', err);
                return res.json([]);
            }
            res.json(results);
        });
    });
});

// API PARA ESTATÍSTICAS DE ENTRADA
router.get('/api/input-statistics', requireAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    // Buscar produtos com estoque baixo
    const lowStockQuery = 'SELECT COUNT(*) as count FROM produtos WHERE quantidade <= estoque_minimo AND quantidade > 0';
    const outOfStockQuery = 'SELECT COUNT(*) as count FROM produtos WHERE quantidade = 0';
    
    // Buscar estatísticas de entrada
    const todayQuery = `
        SELECT COUNT(*) as count 
        FROM movimentacoes 
        WHERE tipo = 'entrada' AND DATE(data_movimentacao) = ?
    `;

    const weekQuery = `
        SELECT COUNT(*) as count 
        FROM movimentacoes 
        WHERE tipo = 'entrada' 
        AND YEARWEEK(data_movimentacao, 1) = YEARWEEK(CURDATE(), 1)
    `;

    const monthQuery = `
        SELECT COUNT(*) as count 
        FROM movimentacoes 
        WHERE tipo = 'entrada' 
        AND YEAR(data_movimentacao) = YEAR(CURDATE()) 
        AND MONTH(data_movimentacao) = MONTH(CURDATE())
    `;

    const suppliersQuery = `
        SELECT 
            SUBSTRING_INDEX(SUBSTRING_INDEX(projeto_experimento, 'Fornecedor: ', -1), ' ', 1) as supplier,
            COUNT(*) as count
        FROM movimentacoes 
        WHERE tipo = 'entrada' AND projeto_experimento LIKE 'Fornecedor: %'
        GROUP BY supplier
        ORDER BY count DESC
        LIMIT 3
    `;

    // Executar todas as queries
    db.query(lowStockQuery, (err, lowStockResults) => {
        if (err) {
            console.error('Erro ao buscar estoque baixo:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        db.query(outOfStockQuery, (err, outOfStockResults) => {
            if (err) {
                console.error('Erro ao buscar estoque esgotado:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
            }

            // Executar queries de estatísticas
            db.query(todayQuery, [today], (err, todayResults) => {
                if (err) {
                    console.error('Erro ao buscar entradas de hoje:', err);
                    return res.status(500).json({ error: 'Erro no servidor' });
                }

                db.query(weekQuery, (err, weekResults) => {
                    if (err) {
                        console.error('Erro ao buscar entradas da semana:', err);
                        return res.status(500).json({ error: 'Erro no servidor' });
                    }

                    db.query(monthQuery, (err, monthResults) => {
                        if (err) {
                            console.error('Erro ao buscar entradas do mês:', err);
                            return res.status(500).json({ error: 'Erro no servidor' });
                        }

                        db.query(suppliersQuery, (err, suppliersResults) => {
                            if (err) {
                                console.error('Erro ao buscar fornecedores:', err);
                                // Continua mesmo com erro nos fornecedores
                            }

                            res.json({
                                todayInputs: todayResults[0]?.count || 0,
                                weekInputs: weekResults[0]?.count || 0,
                                monthInputs: monthResults[0]?.count || 0,
                                lowStockItems: lowStockResults[0]?.count || 0,
                                outOfStockItems: outOfStockResults[0]?.count || 0,
                                recentSuppliers: suppliersResults || []
                            });
                        });
                    });
                });
            });
        });
    });
});


// API PARA TODAS AS MOVIMENTAÇÕES DE ENTRADA (COM PAGINAÇÃO)
router.get('/api/all-input-movements', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query para contar o total
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        WHERE m.tipo = 'entrada'
    `;

    // Query para buscar os dados
    const dataQuery = `
        SELECT 
            m.id_movimentacao as id,
            p.nome as reagent,
            m.tipo as type,
            m.quantidade as quantity,
            m.unidade_medida as unit,
            m.responsavel as responsible,
            m.projeto_experimento as project,
            m.data_movimentacao as date
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        WHERE m.tipo = 'entrada'
        ORDER BY m.data_movimentacao DESC
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, (err, countResults) => {
        if (err) {
            console.error('Erro ao contar movimentações:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(dataQuery, [limit, offset], (err, dataResults) => {
            if (err) {
                console.error('Erro ao buscar movimentações:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
            }

            res.json({
                data: dataResults,
                total: total,
                totalPages: totalPages,
                currentPage: page
            });
        });
    });
});

// API PARA TODAS AS MOVIMENTAÇÕES (ENTRADAS E SAÍDAS)
router.get('/api/all-movements', requireAuth, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const offset = (page - 1) * limit;
    const typeFilter = req.query.type || 'all';
    const searchTerm = req.query.search || '';

    let whereClause = 'WHERE 1=1';
    let queryParams = [];

    // Filtro por tipo
    if (typeFilter !== 'all') {
        whereClause += ' AND m.tipo = ?';
        queryParams.push(typeFilter);
    }

    // Filtro por busca
    if (searchTerm) {
        whereClause += ' AND (p.nome LIKE ? OR m.responsavel LIKE ? OR m.projeto_experimento LIKE ?)';
        const searchPattern = `%${searchTerm}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Query para contar o total
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        ${whereClause}
    `;

    // Query para buscar os dados
    const dataQuery = `
        SELECT 
            m.id_movimentacao as id,
            p.nome as reagent,
            m.tipo as type,
            m.quantidade as quantity,
            m.unidade_medida as unit,
            m.responsavel as responsible,
            m.projeto_experimento as project,
            m.data_movimentacao as date
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        ${whereClause}
        ORDER BY m.data_movimentacao DESC
        LIMIT ? OFFSET ?
    `;

    db.query(countQuery, queryParams, (err, countResults) => {
        if (err) {
            console.error('Erro ao contar movimentações:', err);
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        const total = countResults[0].total;
        const totalPages = Math.ceil(total / limit);

        // Adicionar limit e offset aos parâmetros
        const dataParams = [...queryParams, limit, offset];

        db.query(dataQuery, dataParams, (err, dataResults) => {
            if (err) {
                console.error('Erro ao buscar movimentações:', err);
                return res.status(500).json({ error: 'Erro no servidor' });
            }

            res.json({
                data: dataResults,
                total: total,
                totalPages: totalPages,
                currentPage: page
            });
        });
    });
});

// API PARA ESTATÍSTICAS DAS MOVIMENTAÇÕES
router.get('/api/movements-statistics', requireAuth, (req, res) => {
    // Contar totais por tipo
    const totalsQuery = `
        SELECT 
            tipo,
            COUNT(*) as count
        FROM movimentacoes 
        GROUP BY tipo
    `;

    // Contar reagentes únicos
    const uniqueReagentsQuery = `
        SELECT COUNT(DISTINCT id_produto) as count
        FROM movimentacoes
    `;

    // Buscar movimentações do mês atual
    const monthQuery = `
        SELECT 
            tipo,
            COUNT(*) as count
        FROM movimentacoes 
        WHERE YEAR(data_movimentacao) = YEAR(CURDATE()) 
        AND MONTH(data_movimentacao) = MONTH(CURDATE())
        GROUP BY tipo
    `;

    Promise.all([
        new Promise(resolve => 
            db.query(totalsQuery, (err, res) => resolve(err ? [] : res))
        ),
        new Promise(resolve => 
            db.query(uniqueReagentsQuery, (err, res) => resolve(err ? 0 : res[0].count))
        ),
        new Promise(resolve => 
            db.query(monthQuery, (err, res) => resolve(err ? [] : res))
        )
    ]).then(([totals, uniqueReagents, monthStats]) => {
        const totalEntradas = totals.find(t => t.tipo === 'entrada')?.count || 0;
        const totalSaidas = totals.find(t => t.tipo === 'saida')?.count || 0;
        const entradasMes = monthStats.find(t => t.tipo === 'entrada')?.count || 0;
        const saidasMes = monthStats.find(t => t.tipo === 'saida')?.count || 0;

        res.json({
            totalEntradas,
            totalSaidas,
            totalMovimentacoes: totalEntradas + totalSaidas,
            reagentesUnicos: uniqueReagents,
            entradasMes,
            saidasMes
        });
    }).catch(error => {
        console.error('Erro nas estatísticas:', error);
        res.json({
            totalEntradas: 0,
            totalSaidas: 0,
            totalMovimentacoes: 0,
            reagentesUnicos: 0,
            entradasMes: 0,
            saidasMes: 0
        });
    });
});

// ROTA PARA PÁGINA DE MOVIMENTAÇÕES
router.get('/movimentacoes', requireAuth, (req, res) => {
    res.render('movimentacoes', { 
        user: req.session.user
    });
});

// API PARA ÚLTIMAS MOVIMENTAÇÕES (TODOS OS TIPOS)
router.get('/api/recent-movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = 'sistema_estoque' 
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || result[0].table_exists === 0) {
            // Dados mockados se a tabela não existir
            return res.json([
                {
                    id: 1,
                    reagent: 'Ácido Clorídrico P.A.',
                    type: 'saida',
                    quantity: 2.5,
                    unit: 'L',
                    responsible: 'João Silva',
                    project: 'Projeto A',
                    date: new Date().toISOString()
                },
                {
                    id: 2,
                    reagent: 'Hidróxido de Sódio',
                    type: 'entrada',
                    quantity: 5.0,
                    unit: 'kg',
                    responsible: 'Maria Santos',
                    project: 'Fornecedor: Química Ltda',
                    date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    reagent: 'Sulfato de Cobre II',
                    type: 'saida',
                    quantity: 1.0,
                    unit: 'kg',
                    responsible: 'Pedro Oliveira',
                    project: 'Projeto B',
                    date: new Date(Date.now() - 172800000).toISOString()
                },
                {
                    id: 4,
                    reagent: 'Ácido Sulfúrico',
                    type: 'entrada',
                    quantity: 3.0,
                    unit: 'L',
                    responsible: 'Ana Costa',
                    project: 'Fornecedor: LabSupply',
                    date: new Date(Date.now() - 259200000).toISOString()
                }
            ]);
        }

        // Buscar dados reais - últimas 4 movimentações de qualquer tipo
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            ORDER BY m.data_movimentacao DESC
            LIMIT 4
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações recentes:', err);
                return res.json([]);
            }
            res.json(results);
        });
    });
});

// ROTA PARA RELATÓRIOS
router.get('/relatorios', requireAuth, (req, res) => {
    res.render('relatorios', { 
        user: req.session.user
    });
});

// ROTA PARA LOGOUT
router.get('/logout', requireAuth, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/login');
    });
});

// ROTA PARA VIDRAÇARIAS
router.get('/vidracarias', requireAuth, (req, res) => {
    const {
        search,
        category,
        status
    } = req.query;

    let query = 'SELECT * FROM vidracarias WHERE 1=1';
    let queryParams = [];

    // Filtro por pesquisa
    if (search) {
        query += ' AND (nome LIKE ? OR descricao LIKE ? OR material LIKE ?)';
        const searchPattern = `%${search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filtro por categoria
    if (category) {
        query += ' AND categoria = ?';
        queryParams.push(category);
    }

    // Filtro por status
    if (status) {
        switch (status) {
            case 'available':
                query += ' AND quantidade > 0';
                break;
            case 'low_stock':
                query += ' AND quantidade > 0 AND quantidade <= estoque_minimo';
                break;
            case 'out_of_stock':
                query += ' AND quantidade = 0';
                break;
        }
    }

    query += ' ORDER BY nome';

    // Primeiro, buscar as categorias disponíveis
    const categoriesQuery = 'SELECT DISTINCT categoria FROM vidracarias ORDER BY categoria';
    
    db.query(categoriesQuery, (err, categoriesResults) => {
        if (err) {
            console.error('Erro ao buscar categorias:', err);
            categoriesResults = [];
        }

        // Agora buscar as vidrarias
        db.query(query, queryParams, (err, vidracariasResults) => {
            if (err) {
                console.error('Erro ao buscar vidrarias:', err);
                return res.render('vidracarias', {
                    user: req.session.user,
                    vidracarias: [],
                    categories: categoriesResults || [],
                    stats: {
                        total_vidracarias: 0,
                        total_estoque: 0,
                        baixo_estoque: 0,
                        esgotadas: 0
                    },
                    searchTerm: search || '',
                    selectedCategory: category || '',
                    status: status || '',
                    error: 'Erro ao carregar vidrarias'
                });
            }

            // Calcular estatísticas
            const stats = {
                total_vidracarias: vidracariasResults.length,
                total_estoque: vidracariasResults.filter(v => v.quantidade > 0).length,
                baixo_estoque: vidracariasResults.filter(v => v.quantidade > 0 && v.quantidade <= v.estoque_minimo).length,
                esgotadas: vidracariasResults.filter(v => v.quantidade === 0).length
            };

            res.render('vidracarias', {
                user: req.session.user,
                vidracarias: vidracariasResults || [],
                categories: categoriesResults || [],
                stats: stats,
                searchTerm: search || '',
                selectedCategory: category || '',
                status: status || '',
                success: req.query.success,
                error: req.query.error
            });
        });
    });
});

module.exports = router;