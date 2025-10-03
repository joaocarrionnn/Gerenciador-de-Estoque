const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { requireAuth } = require('../middlewares/authMiddleware');
const bcrypt = require('bcrypt');

// =============================================
// ROTAS DE AUTENTICAÇÃO
// =============================================

// Rota para página de login
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('Auth/login', { 
        error: null,
        success: null
    });
});

// Rota para processar login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        // Buscar usuário no banco
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Erro ao buscar usuário:', err);
                return res.render('Auth/login', {
                    error: 'Erro interno do servidor',
                    success: null
                });
            }

            if (results.length === 0) {
                return res.render('Auth/login', {
                    error: 'Email ou senha incorretos',
                    success: null
                });
            }

            const user = results[0];

            // Verificar senha
            const senhaValida = await bcrypt.compare(senha, user.senha);
            if (!senhaValida) {
                return res.render('Auth/login', {
                    error: 'Email ou senha incorretos',
                    success: null
                });
            }

            // Criar sessão
            req.session.user = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo
            };

            res.redirect('/');
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.render('Auth/login', {
            error: 'Erro interno do servidor',
            success: null
        });
    }
});

// Rota para página de criar conta
router.get('/criar_conta', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('Auth/criar_conta', {
        error: null,
        success: null
    });
});

// Rota para processar criação de conta
router.post('/criar_conta', async (req, res) => {
    const { nome, email, senha, confirmar_senha } = req.body;

    try {
        // Validações
        if (!nome || !email || !senha) {
            return res.render('Auth/criar_conta', {
                error: 'Todos os campos são obrigatórios',
                success: null
            });
        }

        if (senha !== confirmar_senha) {
            return res.render('Auth/criar_conta', {
                error: 'As senhas não coincidem',
                success: null
            });
        }

        if (senha.length < 6) {
            return res.render('Auth/criar_conta', {
                error: 'A senha deve ter pelo menos 6 caracteres',
                success: null
            });
        }

        // Verificar se email já existe
        const checkEmailQuery = 'SELECT id FROM usuarios WHERE email = ?';
        db.query(checkEmailQuery, [email], async (err, results) => {
            if (err) {
                console.error('Erro ao verificar email:', err);
                return res.render('Auth/criar_conta', {
                    error: 'Erro interno do servidor',
                    success: null
                });
            }

            if (results.length > 0) {
                return res.render('Auth/criar_conta', {
                    error: 'Este email já está em uso',
                    success: null
                });
            }

            // Hash da senha
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            // Inserir usuário
            const insertQuery = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [nome, email, senhaHash, 'usuario'], (err, result) => {
                if (err) {
                    console.error('Erro ao criar usuário:', err);
                    return res.render('Auth/criar_conta', {
                        error: 'Erro ao criar conta',
                        success: null
                    });
                }

                res.render('Auth/login', {
                    error: null,
                    success: 'Conta criada com sucesso! Faça login para continuar.'
                });
            });
        });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.render('Auth/criar_conta', {
            error: 'Erro interno do servidor',
            success: null
        });
    }
});

// =============================================
// ROTA PRINCIPAL - DASHBOARD
// =============================================

router.get('/', requireAuth, (req, res) => {
    // Buscar estatísticas de produtos
    const statsQuery = `
        SELECT 
            COUNT(*) as total_produtos,
            SUM(quantidade) as total_estoque,
            SUM(CASE WHEN quantidade <= estoque_minimo AND quantidade > 0 THEN 1 ELSE 0 END) as produtos_baixo_estoque,
            SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as produtos_esgotados
        FROM produtos
    `;

    // Buscar estatísticas de vidrarias
    const vidracariasStatsQuery = `
        SELECT 
            COUNT(*) as total_vidracarias,
            SUM(quantidade) as total_estoque_vidracarias,
            SUM(CASE WHEN quantidade <= estoque_minimo AND quantidade > 0 THEN 1 ELSE 0 END) as vidracarias_baixo_estoque,
            SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as vidracarias_esgotadas
        FROM vidracarias
    `;

    // Buscar últimos 4 produtos
    const productsQuery = 'SELECT * FROM produtos ORDER BY data_criacao DESC LIMIT 4';
    
    // Buscar últimas 4 vidrarias
    const vidracariasQuery = 'SELECT * FROM vidracarias ORDER BY data_criacao DESC LIMIT 4';

    db.query(statsQuery, (err, statsResults) => {
        if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return res.render('Home/index', {
                user: req.session.user,
                stats: {
                    total_produtos: 0,
                    total_estoque: 0,
                    produtos_baixo_estoque: 0,
                    produtos_esgotados: 0,
                    total_vidracarias: 0,
                    total_estoque_vidracarias: 0,
                    vidracarias_baixo_estoque: 0,
                    vidracarias_esgotadas: 0
                },
                produtos: [],
                vidracarias: [],
                categorias: [],
                error: 'Erro ao carregar dashboard'
            });
        }

        const stats = statsResults[0] || {
            total_produtos: 0,
            total_estoque: 0,
            produtos_baixo_estoque: 0,
            produtos_esgotados: 0
        };

        // Buscar estatísticas de vidrarias
        db.query(vidracariasStatsQuery, (err, vidracariasStatsResults) => {
            const vidracariasStats = vidracariasStatsResults[0] || {
                total_vidracarias: 0,
                total_estoque_vidracarias: 0,
                vidracarias_baixo_estoque: 0,
                vidracarias_esgotadas: 0
            };

            // Combinar estatísticas
            const combinedStats = {
                ...stats,
                ...vidracariasStats
            };

            // Buscar produtos
            db.query(productsQuery, (err, productsResults) => {
                if (err) {
                    console.error('Erro ao buscar produtos:', err);
                    productsResults = [];
                }

                // Buscar vidrarias
                db.query(vidracariasQuery, (err, vidracariasResults) => {
                    if (err) {
                        console.error('Erro ao buscar vidrarias:', err);
                        vidracariasResults = [];
                    }

                    // Buscar categorias de produtos
                    const categoriesQuery = `
                        SELECT 
                            tipo,
                            COUNT(*) as quantidade,
                            ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM produtos)), 1) as porcentagem
                        FROM produtos 
                        GROUP BY tipo 
                        ORDER BY quantidade DESC
                        LIMIT 5
                    `;

                    db.query(categoriesQuery, (err, categoriesResults) => {
                        if (err) {
                            console.error('Erro ao buscar categorias:', err);
                            categoriesResults = [];
                        }

                        res.render('Home/index', {
                            user: req.session.user,
                            stats: combinedStats,
                            produtos: productsResults,
                            vidracarias: vidracariasResults,
                            categorias: categoriesResults,
                            success: req.query.success,
                            error: req.query.error
                        });
                    });
                });
            });
        });
    });
});

// =============================================
// ROTAS PARA PRODUTOS/REAGENTES
// =============================================

// Rota para exibir produtos (com suporte a pesquisa avançada)
router.get('/produtos', requireAuth, (req, res) => {
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

// Rota para exibir formulário de adição de produto
router.get('/produtos/adicionar', requireAuth, (req, res) => {
    res.render('adicionar', {
        user: req.session.user,
        formData: null, 
        error: null 
    });
});

// Rota para processar adição de produto
router.post('/produtos/adicionar', requireAuth, (req, res) => {
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
        parseFloat(stockQuantity) || 0,
        parseFloat(minStock) || 0,
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
                error: 'Erro ao adicionar produto: ' + err.message,
                formData: req.body,
                success: null
            });
        }

        res.redirect('/produtos?success=Produto adicionado com sucesso');
    });
});

// Rota para deletar produto
router.post('/produtos/deletar/:id', requireAuth, (req, res) => {
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

// Rota para exibir formulário de edição de produto
router.get('/produtos/editar/:id', requireAuth, (req, res) => {
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
router.post('/produtos/editar/:id', requireAuth, (req, res) => {
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
        parseFloat(stockQuantity) || 0,
        parseFloat(minStock) || 0,
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

// =============================================
// ROTAS PARA MOVIMENTAÇÕES - SAÍDA DE REAGENTES
// =============================================

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
        WHERE disponivel = 1 AND quantidade > 0
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

// API PARA REGISTRAR SAÍDA DE REAGENTE
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

            // 3. Registrar movimentação
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

// =============================================
// ROTAS PARA MOVIMENTAÇÕES - ENTRADA DE REAGENTES
// =============================================

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

            // 3. Registrar movimentação de entrada
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


+

// =============================================
// APIs PARA DADOS E ESTATÍSTICAS
// =============================================

// API PARA ESTATÍSTICAS GERAIS
router.get('/api/statistics', requireAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar tabela movimentacoes
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        const tableExists = !err && result && result[0] && result[0].table_exists > 0;

        // Buscar total de produtos
        const totalQuery = 'SELECT COUNT(*) as count FROM produtos WHERE disponivel = 1';
        
        db.query(totalQuery, (err, totalResults) => {
            const totalItems = totalResults && totalResults[0] ? totalResults[0].count : 0;

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

            // Buscar estatísticas reais
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
                        resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                    )
                ),
                new Promise(resolve => 
                    db.query(weekQuery, (err, res) => 
                        resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                    )
                ),
                new Promise(resolve => 
                    db.query(monthQuery, (err, res) => 
                        resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                    )
                ),
                new Promise(resolve => 
                    db.query(reagentsQuery, (err, res) => 
                        resolve(err ? [] : (res || []))
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

// API PARA MOVIMENTAÇÕES DE ENTRADA
router.get('/api/input-movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || !result || !result[0] || result[0].table_exists === 0) {
            // Dados de exemplo se a tabela não existir
            const mockData = [
                {
                    id: 1,
                    reagent: "Ácido Clorídrico P.A.",
                    type: "entrada",
                    quantity: 5.0,
                    unit: "L",
                    responsible: "João Silva",
                    supplier: "Sigma-Aldrich",
                    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                },
                {
                    id: 2,
                    reagent: "Hidróxido de Sódio P.A.", 
                    type: "entrada",
                    quantity: 2.0,
                    unit: "kg",
                    responsible: "Maria Santos",
                    supplier: "Merck",
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                },
                {
                    id: 3,
                    reagent: "Sulfato de Cobre II",
                    type: "entrada", 
                    quantity: 1.5,
                    unit: "kg",
                    responsible: "Carlos Oliveira",
                    supplier: "Vetec",
                    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
                }
            ];
            return res.json(mockData);
        }

        // Buscar dados reais de entrada - QUERY CORRIGIDA
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date,
                CASE 
                    WHEN m.projeto_experimento LIKE 'Fornecedor: %' 
                    THEN REPLACE(SUBSTRING_INDEX(m.projeto_experimento, 'Fornecedor: ', -1), '.', '')
                    ELSE NULL
                END as supplier
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            WHERE m.tipo = 'entrada'
            ORDER BY m.data_movimentacao DESC
            LIMIT 10
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações de entrada:', err);
                // Retornar dados mockados em caso de erro
                const mockData = [
                    {
                        id: 1,
                        reagent: "Ácido Clorídrico P.A.",
                        quantity: 5.0,
                        unit: "L", 
                        responsible: "João Silva",
                        supplier: "Sigma-Aldrich",
                        date: new Date()
                    }
                ];
                return res.json(mockData);
            }
            
            // Processar os resultados para garantir formato correto
            const processedResults = (results || []).map(item => ({
                id: item.id,
                reagent: item.reagent,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit,
                responsible: item.responsible,
                supplier: item.supplier || 'Não informado',
                date: item.date ? new Date(item.date) : new Date()
            }));
            
            res.json(processedResults);
        });
    });
});

// API PARA ESTATÍSTICAS DE ENTRADA
router.get('/api/input-statistics', requireAuth, (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar tabela movimentacoes
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        const tableExists = !err && result && result[0] && result[0].table_exists > 0;

        // Buscar produtos com estoque baixo
        const lowStockQuery = 'SELECT COUNT(*) as count FROM produtos WHERE quantidade <= estoque_minimo AND quantidade > 0';
        const outOfStockQuery = 'SELECT COUNT(*) as count FROM produtos WHERE quantidade = 0';
        
        db.query(lowStockQuery, (err, lowStockResults) => {
            const lowStockItems = lowStockResults && lowStockResults[0] ? lowStockResults[0].count : 0;
            
            db.query(outOfStockQuery, (err, outOfStockResults) => {
                const outOfStockItems = outOfStockResults && outOfStockResults[0] ? outOfStockResults[0].count : 0;

                if (!tableExists) {
                    // Estatísticas mockadas
                    return res.json({
                        todayInputs: 3,
                        weekInputs: 15,
                        monthInputs: 45,
                        lowStockItems: lowStockItems,
                        outOfStockItems: outOfStockItems,
                        recentSuppliers: [
                            { name: 'Sigma-Aldrich', count: 12 },
                            { name: 'Merck', count: 8 },
                            { name: 'Vetec', count: 5 }
                        ]
                    });
                }

                // Buscar estatísticas reais de entrada
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

                // Executar queries
                Promise.all([
                    new Promise(resolve => 
                        db.query(todayQuery, [today], (err, res) => 
                            resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                        )
                    ),
                    new Promise(resolve => 
                        db.query(weekQuery, (err, res) => 
                            resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                        )
                    ),
                    new Promise(resolve => 
                        db.query(monthQuery, (err, res) => 
                            resolve(err ? 0 : (res && res[0] ? res[0].count : 0))
                        )
                    ),
                    new Promise(resolve => 
                        db.query(suppliersQuery, (err, res) => 
                            resolve(err ? [] : (res || []))
                        )
                    )
                ]).then(([todayInputs, weekInputs, monthInputs, recentSuppliers]) => {
                    res.json({
                        todayInputs,
                        weekInputs,
                        monthInputs,
                        lowStockItems,
                        outOfStockItems,
                        recentSuppliers: recentSuppliers.length > 0 ? recentSuppliers : [
                            { supplier: 'Sigma-Aldrich', count: 12 },
                            { supplier: 'Merck', count: 8 },
                            { supplier: 'Vetec', count: 5 }
                        ]
                    });
                }).catch(error => {
                    console.error('Erro nas estatísticas de entrada:', error);
                    res.json({
                        todayInputs: 0,
                        weekInputs: 0,
                        monthInputs: 0,
                        lowStockItems: lowStockItems,
                        outOfStockItems: outOfStockItems,
                        recentSuppliers: []
                    });
                });
            });
        });
    });
});

// API PARA DADOS DAS VIDRARIAS (AJAX)
router.get('/api/vidracarias', requireAuth, (req, res) => {
    const query = 'SELECT * FROM vidracarias ORDER BY nome';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar vidrarias:', err);
            return res.json([]);
        }
        
        res.json(results || []);
    });
});

// API PARA ESTATÍSTICAS DAS VIDRARIAS
router.get('/api/vidracarias/statistics', requireAuth, (req, res) => {
    const statsQuery = `
        SELECT 
            COUNT(*) as total,
            SUM(quantidade) as total_estoque,
            SUM(CASE WHEN quantidade <= estoque_minimo AND quantidade > 0 THEN 1 ELSE 0 END) as baixo_estoque,
            SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as esgotadas,
            categoria,
            COUNT(*) as por_categoria
        FROM vidracarias 
        GROUP BY categoria
    `;

    db.query(statsQuery, (err, results) => {
        if (err) {
            console.error('Erro ao buscar estatísticas:', err);
            return res.json({
                total: 0,
                total_estoque: 0,
                baixo_estoque: 0,
                esgotadas: 0,
                categorias: []
            });
        }

        // Processar resultados
        const stats = {
            total: 0,
            total_estoque: 0,
            baixo_estoque: 0,
            esgotadas: 0,
            categorias: []
        };

        (results || []).forEach(row => {
            if (row.categoria) {
                stats.categorias.push({
                    nome: row.categoria,
                    quantidade: row.por_categoria
                });
            }
            
            // Somar totais (usando o primeiro registro para totais gerais)
            if (stats.total === 0) {
                stats.total = row.total;
                stats.total_estoque = row.total_estoque;
                stats.baixo_estoque = row.baixo_estoque;
                stats.esgotadas = row.esgotadas;
            }
        });

        res.json(stats);
    });
});

// API PARA MOVIMENTAÇÕES DE VIDRARIAS
router.get('/api/vidracarias/movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE() 
        AND table_name = 'movimentacoes_vidracarias'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || !result || !result[0] || result[0].table_exists === 0) {
            // Dados de exemplo se a tabela não existir
            const mockData = [
                {
                    id: 1,
                    tipo: "saida",
                    vidracaria: "Béquer 500mL",
                    quantidade: 5,
                    responsavel: "Dr. Silva",
                    data: new Date(Date.now() - 2 * 60 * 60 * 1000)
                },
                {
                    id: 2,
                    tipo: "entrada", 
                    vidracaria: "Pipeta Graduada 10mL",
                    quantidade: 10,
                    responsavel: "Lab. Central",
                    data: new Date(Date.now() - 5 * 60 * 60 * 1000)
                }
            ];
            return res.json(mockData);
        }

        // Buscar dados reais
        const query = `
            SELECT 
                id,
                tipo,
                vidracaria_nome as vidracaria,
                quantidade,
                responsavel,
                data_movimentacao as data
            FROM movimentacoes_vidracarias
            ORDER BY data_movimentacao DESC
            LIMIT 10
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações:', err);
                return res.json([]);
            }
            
            // Converter datas para objetos Date
            const movimentacoes = (results || []).map(mov => ({
                ...mov,
                data: new Date(mov.data)
            }));
            
            res.json(movimentacoes);
        });
    });
});

// ROTA PARA SAÍDA DE VIDRARIAS
router.post('/api/vidracarias/saida', requireAuth, (req, res) => {
    const { vidracaria_id, quantidade, responsavel, projeto, observacoes } = req.body;

    if (!vidracaria_id || !quantidade || !responsavel) {
        return res.json({
            success: false,
            message: 'Vidraria, quantidade e responsável são obrigatórios'
        });
    }

    const qtdSaida = parseInt(quantidade);
    if (isNaN(qtdSaida) || qtdSaida <= 0) {
        return res.json({
            success: false,
            message: 'Quantidade deve ser um número positivo'
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

    (async () => {
        try {
            // 1. Buscar vidraria
            const vidracariaResults = await query(
                'SELECT id, nome, quantidade FROM vidracarias WHERE id = ?',
                [vidracaria_id]
            );

            if (vidracariaResults.length === 0) {
                return res.json({
                    success: false,
                    message: 'Vidraria não encontrada'
                });
            }

            const vidracaria = vidracariaResults[0];
            const quantidadeAtual = parseInt(vidracaria.quantidade);

            // Verificar estoque
            if (quantidadeAtual < qtdSaida) {
                return res.json({
                    success: false,
                    message: `Estoque insuficiente! Disponível: ${quantidadeAtual} unidades`
                });
            }

            const novaQuantidade = quantidadeAtual - qtdSaida;

            // 2. Atualizar estoque
            await query(
                'UPDATE vidracarias SET quantidade = ? WHERE id = ?',
                [novaQuantidade, vidracaria_id]
            );

            // 3. Registrar movimentação
            try {
                await query(
                    `INSERT INTO movimentacoes_vidracarias 
                    (vidracaria_id, vidracaria_nome, tipo, quantidade, responsavel, projeto, observacoes)
                    VALUES (?, ?, 'saida', ?, ?, ?, ?)`,
                    [
                        vidracaria_id,
                        vidracaria.nome,
                        qtdSaida,
                        responsavel,
                        projeto,
                        observacoes || `Saída registrada por ${responsavel}`
                    ]
                );
            } catch (movimentacaoError) {
                console.log('Tabela movimentacoes_vidracarias não existe:', movimentacaoError.message);
            }

            res.json({
                success: true,
                message: `Saída de ${qtdSaida} unidades de ${vidracaria.nome} registrada com sucesso!`,
                data: {
                    vidracaria: vidracaria.nome,
                    quantidade: qtdSaida,
                    estoque_atual: novaQuantidade,
                    responsavel: responsavel
                }
            });

        } catch (error) {
            console.error('Erro no processo de saída:', error);
            res.json({
                success: false,
                message: 'Erro interno do servidor: ' + error.message
            });
        }
    })();
});



// API PARA MOVIMENTAÇÕES DE SAÍDA (APENAS SAÍDAS - 4 ÚLTIMAS)
router.get('/api/output-movements', requireAuth, (req, res) => {
    // Buscar apenas movimentações de saída
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
        
        // Processar os resultados
        const processedResults = (results || []).map(item => ({
            id: item.id,
            reagent: item.reagent,
            type: item.type,
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit,
            responsible: item.responsible,
            project: item.project,
            date: item.date ? new Date(item.date) : new Date()
        }));
        
        console.log(`📤 Movimentações de saída carregadas: ${processedResults.length} registros`);
        res.json(processedResults);
    });
});

// API PARA MOVIMENTAÇÕES DE ENTRADA (APENAS ENTRADAS - 4 ÚLTIMAS)
router.get('/api/input-movements', requireAuth, (req, res) => {
    // Verificar se a tabela existe
    const checkTableQuery = `
        SELECT COUNT(*) as table_exists 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        AND table_name = 'movimentacoes'
    `;

    db.query(checkTableQuery, (err, result) => {
        if (err || !result || !result[0] || result[0].table_exists === 0) {
            console.log('Tabela movimentacoes não existe');
            return res.json([]);
        }

        // Buscar apenas movimentações de entrada
        const query = `
            SELECT 
                m.id_movimentacao as id,
                p.nome as reagent,
                m.tipo as type,
                m.quantidade as quantity,
                m.unidade_medida as unit,
                m.responsavel as responsible,
                m.projeto_experimento as project,
                m.data_movimentacao as date,
                CASE 
                    WHEN m.projeto_experimento LIKE 'Fornecedor: %' 
                    THEN REPLACE(SUBSTRING_INDEX(m.projeto_experimento, 'Fornecedor: ', -1), '.', '')
                    ELSE NULL
                END as supplier
            FROM movimentacoes m
            JOIN produtos p ON m.id_produto = p.id_produto
            WHERE m.tipo = 'entrada'
            ORDER BY m.data_movimentacao DESC
            LIMIT 4
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Erro ao buscar movimentações de entrada:', err);
                return res.json([]);
            }
            
            // Processar os resultados
            const processedResults = (results || []).map(item => ({
                id: item.id,
                reagent: item.reagent,
                type: item.type,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit,
                responsible: item.responsible,
                project: item.project,
                supplier: item.supplier || 'Não informado',
                date: item.date ? new Date(item.date) : new Date()
            }));
            
            console.log(`📥 Movimentações de entrada carregadas: ${processedResults.length} registros`);
            res.json(processedResults);
        });
    });
});

// API PARA MOVIMENTAÇÕES GERAIS (AMBOS - 4 ÚLTIMAS - DASHBOARD)
router.get('/api/movements', requireAuth, (req, res) => {
    // Buscar todas as movimentações (entradas e saídas)
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
            console.error('Erro ao buscar movimentações:', err);
            return res.json([]);
        }
        
        // Processar os resultados
        const processedResults = (results || []).map(item => ({
            id: item.id,
            reagent: item.reagent,
            type: item.type,
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit,
            responsible: item.responsible,
            project: item.project,
            date: item.date ? new Date(item.date) : new Date()
        }));
        
        console.log(`📊 Movimentações do dashboard carregadas: ${processedResults.length} registros`);
        res.json(processedResults);
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

module.exports = router;