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

// Nova rota para produtos
router.get('/products', (req, res) => {
    res.render('Produtos/produtos', {
        user: { 
            name: 'João Carrion', 
            email: 'joao.carrion@empresa.com',
            role: 'Administrador' 
        }
    });
});

module.exports = router;