const bcrypt = require('bcrypt');
const AuthModel = require('../models/AuthModel');

class AuthController {
    // Página de login
    static login(req, res) {
        res.render("auth/login", { error: null });
    }

    // Página de criação de conta
    static criarConta(req, res) {
        res.render("auth/criar_conta", { error: null, success: null });
    }

    // Página de recuperação de senha
    static recuperarSenha(req, res) {
        res.render("auth/recuperar_senha", { error: null, success: null })
    }

    // Processar criação de conta
    static async processarCriarConta(req, res) {
        try {
            console.log('📨 Body recebido:', req.body);
            const { nome, email, departamento, justificativa, senha, confirmar_senha } = req.body;
            
            console.log('📨 Dados recebidos do formulário:', {
                nome, email, departamento, 
                senha: senha ? '***' : 'vazia', 
                confirmar_senha: confirmar_senha ? '***' : 'vazia'
            });

            // Validações
            if (senha !== confirmar_senha) {
                console.log('❌ Senhas não coincidem');
                return res.render("auth/criar_conta", { 
                    error: "As senhas não coincidem!",
                    success: null,
                    nome, email, departamento, justificativa
                });
            }

            if (senha.length < 6) {
                console.log('❌ Senha muito curta');
                return res.render("auth/criar_conta", { 
                    error: "A senha deve ter pelo menos 6 caracteres!",
                    success: null,
                    nome, email, departamento, justificativa
                });
            }

            // Verificar se usuário já existe
            console.log('🔍 Verificando se usuário já existe...');
            const usuarioExistente = await AuthModel.verificarUsuarioExistente(email);
            if (usuarioExistente) {
                console.log('❌ Usuário já existe');
                return res.render("auth/criar_conta", { 
                    error: "Já existe um usuário com este e-mail!",
                    success: null,
                    nome, email: '', departamento, justificativa
                });
            }

            // Criar hash da senha
            console.log('🔐 Criando hash da senha...');
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            // Gerar nome de usuário a partir do email
            const usuario = email.split('@')[0];

            // Dados para salvar no banco
            const dadosUsuario = {
                nome_completo: nome,
                usuario: usuario,
                email: email,
                senha: senhaHash,
                departamento: departamento,
                justificativa: justificativa,
                status: 'pendente',
                tipo: 'usuario'
            };

            console.log('💾 Dados para salvar:', { ...dadosUsuario, senha: '***' });

            // Salvar no banco
            console.log('💾 Salvando no banco...');
            const resultado = await AuthModel.criarUsuario(dadosUsuario);
            
            console.log('✅ Usuário criado com ID:', resultado.insertId);

            res.render("auth/criar_conta", { 
                error: null, 
                success: "Solicitação enviada com sucesso! Aguarde a aprovação do administrador.",
                nome: '', email: '', departamento: '', justificativa: ''
            });

        } catch (error) {
            console.error('💥 Erro completo ao criar conta:', error);
            res.render("auth/criar_conta", { 
                error: "Erro ao processar solicitação. Tente novamente.",
                success: null,
                nome: req.body.nome, 
                email: req.body.email, 
                departamento: req.body.departamento, 
                justificativa: req.body.justificativa
            });
        }
    }

    // Processar login
    static processarLogin(req, res) {
        const { username, password } = req.body;
        
        console.log('Tentativa de login com usuário:', username);
        
        AuthModel.verificarUsuario(username)
            .then(user => {
                if (!user) {
                    console.log('Usuário não encontrado');
                    return res.render("auth/login", { 
                        error: "Usuário não encontrado!",
                        username: username
                    });
                }

                // Verificar se está aprovado
                if (user.status !== 'aprovado') {
                    console.log('Usuário não aprovado:', user.status);
                    return res.render("auth/login", { 
                        error: "Sua conta ainda não foi aprovada. Aguarde a liberação do administrador.",
                        username: username
                    });
                }

                console.log('Usuário encontrado, verificando senha...');
                
                // Comparar senha
                bcrypt.compare(password, user.senha)
                    .then(match => {
                        if (!match) {
                            console.log('Senha incorreta');
                            return res.render("auth/login", { 
                                error: "Senha incorreta!",
                                username: username
                            });
                        }

                        console.log('Login bem-sucedido para:', user.usuario);
                        
                        req.session.user = {
                            id: user.id_usuario,
                            usuario: user.usuario,
                            nome: user.nome_completo,
                            email: user.email,
                            tipo: user.tipo,
                            departamento: user.departamento
                        };

                        res.redirect("/");
                    })
                    .catch(err => {
                        console.error('Erro ao comparar senha:', err);
                        res.render("auth/login", { 
                            error: "Erro no servidor",
                            username: username
                        });
                    });
            })
            .catch(err => {
                console.error('Erro ao buscar usuário:', err);
                res.render("auth/login", { 
                    error: "Erro no servidor",
                    username: username
                });
            });
    }

    // Logout
    static logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao fazer logout:', err);
            }
            res.redirect("/auth/login");
        });
    }
}

module.exports = AuthController;