// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        next();
    } else {
        res.redirect('/?error=Acesso restrito a administradores');
    }
};

// Middleware para verificar se é usuário comum (apenas visualização)
const requireUserViewOnly = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'usuario') {
        // Verificar se a rota é permitida para usuários (apenas visualização)
        const allowedRoutes = [
            '/', 
            '/produtos', 
            '/vidracarias', 
            '/perfil',
            '/auth/logout'  // ⭐ CORRIGIDO: adicione a rota completa do logout
        ];
        
        // Também permitir métodos POST para logout e atualização de perfil
        const allowedPostRoutes = [
            '/auth/logout',
            '/perfil/atualizar',
            '/perfil/upload-foto'
        ];
        
        // Se for uma rota GET permitida ou uma rota POST permitida, permite acesso
        if (allowedRoutes.includes(req.path) || 
            (req.method === 'POST' && allowedPostRoutes.includes(req.path))) {
            return next();
        }
        
        console.log('❌ Acesso negado para usuário comum:', {
            metodo: req.method,
            rota: req.path,
            usuario: req.session.user.usuario
        });
        
        res.redirect('/?error=Acesso não autorizado. Seu perfil permite apenas visualização de estoque.');
    } else {
        next();
    }
};

module.exports = {
    requireAdmin,
    requireUserViewOnly
};