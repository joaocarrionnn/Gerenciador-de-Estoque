// Middleware para verificar se o usuário está autenticado
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

// Middleware para verificar se o usuário NÃO está autenticado (para páginas de login)
function requireNoAuth(req, res, next) {
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// Middleware para verificar permissões de administrador
function requireAdmin(req, res, next) {
    if (req.session.user && req.session.user.tipo === 'admin') {
        next();
    } else {
        res.status(403).render('error', { 
            message: 'Acesso não autorizado',
            user: req.session.user 
        });
    }
}

module.exports = {
    requireAuth,
    requireNoAuth,
    requireAdmin
};