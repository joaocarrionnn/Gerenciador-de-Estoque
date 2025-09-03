const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Conexão com MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sistema_estoque"
});

// Página de login
router.get("/login", (req, res) => {
    res.render("Auth/login", { error: null });
});

// Página de criação de conta (solicitação de acesso)
router.get("/criar-conta", (req, res) => {
    res.render("Auth/criar_conta", { error: null, success: null });
});

// Processar solicitação de acesso (sem banco de dados)
router.post("/solicitar-acesso", (req, res) => {
    const { nome, email, departamento, justificativa } = req.body;
    
    // Simular processamento (em um sistema real, aqui você salvaria no banco de dados)
    console.log("Nova solicitação de acesso:");
    console.log("Nome:", nome);
    console.log("E-mail:", email);
    console.log("Departamento:", departamento);
    console.log("Justificativa:", justificativa);
    console.log("Data:", new Date().toLocaleString());
    
    // Simular envio de e-mail (apenas para demonstração)
    console.log("E-mail de notificação enviado para os administradores");
    
    // Renderizar página de sucesso
    res.render("Auth/criar_ conta", { 
        error: null, 
        success: "Solicitação enviada com sucesso! Um administrador entrará em contato em breve." 
    });
});

// Processar login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM usuarios WHERE usuario = ?", [username], async (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.render("Auth/login", { error: "Usuário não encontrado!" });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.senha);

        if (!match) {
            return res.render("Auth/login", { error: "Senha incorreta!" });
        }

        // Criar sessão
        req.session.user = {
            id: user.id_usuario,
            usuario: user.usuario,
            tipo: user.tipo
        };

        res.redirect("/"); // vai para dashboard
    });
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});

module.exports = router;