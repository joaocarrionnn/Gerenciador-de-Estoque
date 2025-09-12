const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('Home/index', { 
        user: { name: 'João Carrion', role: 'Administrador' } 
    });
});

router.get('/login', (req, res) => {
    res.render('Auth/login');
});

router.get('/criar_conta', (req, res) => {
    res.render('Auth/criar_conta');
});

// Rota corrigida para produtos
router.get('/produtos', (req, res) => {
    res.render('produtos', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao@email.com', 
            role: 'Administrador' 
        }
    });
});

// Rota para exibir o formulário de adição de produtos
router.get('/produtos/adicionar', (req, res) => {
    res.render('adicionar', { 
        user: { 
            name: 'João Carrion', 
            email: 'joao.carrion@empresa.com',
            role: 'Administrador' 
        }
    });
});

// Rota para processar o formulário de adição de produtos
router.post('/produtos/adicionar', (req, res) => {
    // Aqui você processaria os dados do formulário
    const {
        productName,
        productType,
        dangerLevel,
        regulatoryOrg,
        stockQuantity,
        unit,
        availability
    } = req.body;
    
    // Simulação: salvar no banco de dados (em produção, conecte com seu banco)
    console.log('Novo produto adicionado:', {
        productName,
        productType,
        dangerLevel,
        regulatoryOrg,
        stockQuantity,
        unit,
        availability,
        addedAt: new Date()
    });
    
    // Redirecionar de volta para a página de produtos com mensagem de sucesso
    res.redirect('/produtos?success=Produto adicionado com sucesso');
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