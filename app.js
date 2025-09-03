const express = require('express');
const session = require("express-session"); // Certifique-se de instalar: npm install express-session
const path = require('path');
const multer = require('multer');
const app = express();

// Configuração de sessão (ADICIONE ISSO)
app.use(session({
    secret: 'tripleJ', // Altere para uma chave segura
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Defina como true se estiver usando HTTPS
}));

    // Configuração do Multer para upload de arquivos
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, 'uploads/profile-photos/'));
        },
        filename: function (req, file, cb) {
            // Gera um nome único para o arquivo
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
            // Aceitar apenas imagens
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Apenas imagens são permitidas!'), false);
            }
        }
    });

    // Configuração do EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // Middleware para arquivos estáticos
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




    // Middleware para parsing do body
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Rotas principais
    const indexRoutes = require('./routes/index');
    app.use('/', indexRoutes);

    // Rotas de perfil
    const perfilRoutes = require('./routes/perfil')(upload);
    app.use('/perfil', perfilRoutes);

    // Middleware de erro
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });