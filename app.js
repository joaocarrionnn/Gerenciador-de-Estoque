const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
    secret: 'tripleJ',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.locals.formatarNumero = function(num) {
    if (num === null || num === undefined || num === '') return '0,0';
    const numero = parseFloat(num);
    if (isNaN(numero)) return '0,0';
    return numero.toFixed(1).replace('.', ',');
};

// Middleware de permissão para usuários comuns (APENAS para rotas específicas)
app.use((req, res, next) => {
    // Lista de rotas que usuários comuns podem acessar livremente
    const allowedRoutes = [
        '/auth/logout',
        '/perfil',
        '/perfil/atualizar',
        '/perfil/upload-foto'
    ];
    
    // Se for uma rota permitida ou se não for usuário comum, passa direto
    if (allowedRoutes.includes(req.path) || 
        !req.session.user || 
        req.session.user.tipo !== 'usuario') {
        return next();
    }
    
    // Para outras rotas, aplica as restrições
    const { requireUserViewOnly } = require('./middlewares/permissionMiddleware');
    requireUserViewOnly(req, res, next);
});

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/uploads/profile-photos/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'), false);
        }
    }
});

// Debug da sessão
app.use((req, res, next) => {
    console.log('Sessão atual:', req.session);
    console.log('Usuário na sessão:', req.session.user);
    next();
});

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Middleware para parsing do body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Importar middleware de autenticação
const { requireAuth } = require('./middlewares/authMiddleware');

// Middleware de permissão para usuários comuns
app.use((req, res, next) => {
    const { requireUserViewOnly } = require('./middlewares/permissionMiddleware');
    
    if (req.session.user && req.session.user.tipo === 'usuario') {
        requireUserViewOnly(req, res, next);
    } else {
        next();
    }
});

// Rotas de autenticação (não protegidas)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

app.post('/criar_conta', (req, res) => {
    const AuthController = require('./controllers/AuthController');
    AuthController.processarCriarConta(req, res);
});

// ⚠️ REMOVA ESTA ROTA DAQUI - ELA ESTÁ CONFLITANDO
// Rota raiz redireciona para home
// app.get('/', requireAuth, (req, res) => {
//     res.render('home/index', { 
//         user: req.session.user 
//     });
// });

// Rotas principais (protegidas) - ESTA É A ROTA CORRETA QUE USA O HomeController
const indexRoutes = require('./routes/index');
app.use('/', requireAuth, indexRoutes);

// Rotas de perfil (protegidas)
const perfilRoutes = require('./routes/perfil');
app.use('/perfil', requireAuth, perfilRoutes);

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                success: false, 
                message: 'Arquivo muito grande. Tamanho máximo: 5MB' 
            });
        }
    }
    
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// Rota para arquivos não encontrados (404)
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Página não encontrada',
        user: req.session.user 
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});