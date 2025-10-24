const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do armazenamento para fotos de perfil
const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/profile-photos/');
        
        // Criar diretório se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configuração do armazenamento para PDFs de produtos
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/product-pdfs/');
        
        // Criar diretório se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Sanitizar o nome do arquivo
        const sanitizedName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-zA-Z0-9.-]/g, '_'); // Substitui caracteres especiais
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileName = 'product-' + uniqueSuffix + '-' + sanitizedName;
        
        cb(null, fileName);
    }
});

// Filtro de arquivos para imagens
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

// Filtro de arquivos para PDFs
const pdfFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
};

// Criar as instâncias do multer
const uploadProfile = multer({
    storage: profileStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: imageFilter
});

const uploadPDF = multer({
    storage: pdfStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        files: 10 // Máximo de 10 arquivos
    },
    fileFilter: pdfFilter
});

// Exportar as instâncias diretamente
module.exports = {
    uploadProfile: uploadProfile,
    uploadPDF: uploadPDF,
    uploadProductWithPDFs: uploadPDF.array('pdfFiles', 10)
};