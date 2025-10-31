// controllers/HomeController.js
const db = require('../config/database');

class HomeController {
    static index(req, res) {
        console.log('🏠 HomeController.index chamado');
        console.log('👤 Usuário na sessão:', req.session.user);
        
        // Verificar se é admin ou usuário comum
        const isAdmin = req.session.user && req.session.user.tipo === 'admin';
        
        console.log('🔍 Tipo de usuário:', isAdmin ? 'ADMIN' : 'USUÁRIO COMUM');
        
        if (isAdmin) {
            // Dashboard para administradores (com dados completos)
            console.log('🔧 Carregando dashboard ADMIN com dados completos');
            HomeController.adminDashboard(req, res);
        } else {
            // Dashboard para usuários comuns (apenas visualização)
            console.log('👤 Carregando dashboard USUÁRIO');
            HomeController.userDashboard(req, res);
        }
    }

    static adminDashboard(req, res) {
        console.log('📊 Carregando dashboard do administrador...');
        
        // Buscar últimos produtos
        const productsQuery = 'SELECT * FROM produtos ORDER BY data_criacao DESC LIMIT 5';
        
        db.query(productsQuery, (err, productsResults) => {
            if (err) {
                console.error('Erro ao buscar produtos:', err);
                return res.render('home/index', {
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

                            return res.render('home/index', {
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

                        res.render('home/index', {
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

                console.log('✅ Dashboard admin carregado com sucesso:');
                console.log('📊 Total produtos:', stats.total_produtos);
                console.log('📦 Total estoque:', stats.total_estoque);
                console.log('⚠️  Baixo estoque:', stats.produtos_baixo_estoque);
                console.log('❌ Esgotados:', stats.produtos_esgotados);

                res.render('home/index', {
                    user: req.session.user,
                    stats: stats,
                    produtos: productsResults,
                    categorias: categoriesResults,
                    success: req.query.success,
                    error: req.query.error
                });
            });
        });
    }

    static userDashboard(req, res) {
        console.log('📊 Carregando dashboard do usuário...');
        
        // Buscar estatísticas gerais para o usuário (apenas visualização)
        const statsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM produtos WHERE quantidade > 0) as total_reagentes,
                (SELECT COUNT(*) FROM vidracarias WHERE quantidade > 0) as total_vidrarias,
                (SELECT COUNT(*) FROM produtos WHERE quantidade <= estoque_minimo AND quantidade > 0) as reagentes_baixo_estoque,
                (SELECT COUNT(*) FROM vidracarias WHERE quantidade <= estoque_minimo AND quantidade > 0) as vidrarias_baixo_estoque
        `;

        // Buscar últimos produtos adicionados (para visualização)
        const recentProductsQuery = `
            SELECT nome, tipo, quantidade, unidade_medida, localizacao
            FROM produtos 
            WHERE quantidade > 0
            ORDER BY data_criacao DESC 
            LIMIT 5
        `;

        // Buscar últimas vidrarias adicionadas (para visualização)
        const recentGlasswareQuery = `
            SELECT nome, categoria, capacidade, material, quantidade
            FROM vidracarias 
            WHERE quantidade > 0
            ORDER BY data_criacao DESC 
            LIMIT 5
        `;

        // Executar todas as queries
        db.query(statsQuery, (err, statsResults) => {
            if (err) {
                console.error('❌ Erro ao buscar estatísticas:', err);
                statsResults = [{}];
            }

            db.query(recentProductsQuery, (err, productsResults) => {
                if (err) {
                    console.error('❌ Erro ao buscar produtos recentes:', err);
                    productsResults = [];
                }

                db.query(recentGlasswareQuery, (err, glasswareResults) => {
                    if (err) {
                        console.error('❌ Erro ao buscar vidrarias recentes:', err);
                        glasswareResults = [];
                    }

                    const stats = statsResults[0] || {
                        total_reagentes: 0,
                        total_vidrarias: 0,
                        reagentes_baixo_estoque: 0,
                        vidrarias_baixo_estoque: 0
                    };

                    console.log('✅ Dashboard do usuário carregado com sucesso');
                    
                    res.render('home/user-dashboard', {
                        user: req.session.user,
                        stats: stats,
                        recentProducts: productsResults,
                        recentGlassware: glasswareResults,
                        success: req.query.success,
                        error: req.query.error
                    });
                });
            });
        });
    }
}

module.exports = HomeController;