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

module.exports = router;