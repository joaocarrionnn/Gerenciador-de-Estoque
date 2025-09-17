const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');

const app = express();

// Configuração de sessão
app.use(session({
    secret: 'tripleJ',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware para disponibilizar usuário nas views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
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
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'), false);
        }
    }
});

// Adicione isso antes das rotas no app.js
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

// Rotas de autenticação (não protegidas)
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Rotas principais (protegidas)
const indexRoutes = require('./routes/index');
app.use('/', requireAuth, indexRoutes);

// Rotas de perfil (protegidas) - Agora usando o upload configurado
const perfilRoutes = require('./routes/perfil');
app.use('/perfil', requireAuth, perfilRoutes);

// Rota raiz redireciona para home
app.get('/', requireAuth, (req, res) => {
    res.render('home/index', { 
        user: req.session.user 
    });
});

// Middleware de erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Se for erro de upload do Multer
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
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Página não encontrada</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                h1 { color: #d32f2f; }
            </style>
        </head>
        <body>
            <h1>404 - Página não encontrada</h1>
            <p>A página que você está procurando não existe.</p>
            <a href="/">Voltar para a página inicial</a>
        </body>
        </html>
    `);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});