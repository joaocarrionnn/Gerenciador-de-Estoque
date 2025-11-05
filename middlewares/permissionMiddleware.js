// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'admin') {
        next();
    } else {
        // Se for API, retorna JSON, senão redireciona
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({ 
                success: false, 
                error: 'Acesso restrito a administradores' 
            });
        }
        res.redirect('/?error=Acesso restrito a administradores');
    }
};

// Middleware para verificar se é usuário comum (apenas visualização)
const requireUserViewOnly = (req, res, next) => {
    if (req.session.user && req.session.user.tipo === 'usuario') {
        // ⭐⭐ ROTAS PERMITIDAS PARA USUÁRIOS COMUNS ⭐⭐
        const allowedRoutes = [
            '/', 
            '/produtos', 
            '/vidracarias', 
            '/perfil',
            '/auth/logout'
        ];
        
        // ⭐⭐ MÉTODOS POST PERMITIDOS ⭐⭐
        const allowedPostRoutes = [
            '/auth/logout',
            '/perfil/atualizar',
            '/perfil/upload-foto'
        ];
        
        // ⭐⭐ PERMITIR TODAS AS ROTAS API PARA VISUALIZAÇÃO ⭐⭐
        if (req.path.startsWith('/api/')) {
            return next();
        }
        
        // ⭐⭐ SE FOR UMA ROTA PERMITIDA, PASSA DIRETO ⭐⭐
        if (allowedRoutes.includes(req.path)) {
            return next();
        }
        
        // ⭐⭐ SE FOR UM MÉTODO POST PERMITIDO, PASSA DIRETO ⭐⭐
        if (req.method === 'POST' && allowedPostRoutes.includes(req.path)) {
            return next();
        }
        
        console.log('❌ Acesso negado para usuário comum:', {
            metodo: req.method,
            rota: req.path,
            usuario: req.session.user.usuario
        });
        
        // ⭐⭐ REDIRECIONAMENTO SEGURO - SEM LOOP ⭐⭐
        if (req.path.startsWith('/api/')) {
            return res.status(403).json({ 
                success: false, 
                error: 'Acesso não autorizado para seu tipo de usuário' 
            });
        }
        
        // Redireciona para home com mensagem de erro
        return res.redirect('/?error=Seu perfil permite apenas visualização de estoque');
    } else {
        next();
    }
};

module.exports = {
    requireAdmin,
    requireUserViewOnly
};