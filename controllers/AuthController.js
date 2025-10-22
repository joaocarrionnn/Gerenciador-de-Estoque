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
            const { nome, usuario, senha, turma, cpf, palavraChave, email } = req.body;
            
            console.log('📨 Dados recebidos do formulário:', {
                nome, usuario, turma, cpf, email,
                senha: senha ? '***' : 'vazia',
                palavraChave: palavraChave ? '***' : 'vazia'
            });

            // Validações básicas
            if (!nome || !usuario || !senha || !turma || !cpf || !palavraChave || !email) {
                return res.render("auth/criar_conta", { 
                    error: "Todos os campos são obrigatórios!",
                    success: null,
                    nome, usuario, email, turma, cpf
                });
            }

            if (senha.length < 6) {
                console.log('❌ Senha muito curta');
                return res.render("auth/criar_conta", { 
                    error: "A senha deve ter pelo menos 6 caracteres!",
                    success: null,
                    nome, usuario, email, turma, cpf
                });
            }

            // Limpar formatação do CPF para validação
            const cpfLimpo = cpf.replace(/\D/g, '');

            // Verificar se CPF é válido (11 dígitos)
            if (cpfLimpo.length !== 11) {
                return res.render("auth/criar_conta", { 
                    error: "CPF inválido! Digite um CPF com 11 dígitos.",
                    success: null,
                    nome, usuario, email, turma, cpf
                });
            }

            // Verificar se email é válido
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.render("auth/criar_conta", { 
                    error: "E-mail inválido! Digite um e-mail válido.",
                    success: null,
                    nome, usuario, email, turma, cpf
                });
            }

            // Verificar duplicidades individuais
            console.log('🔍 Verificando duplicidades...');
            
            const [cpfExistente, usuarioExistente, emailExistente] = await Promise.all([
                AuthModel.verificarUsuarioExistentePorCampo('cpf', cpfLimpo),
                AuthModel.verificarUsuarioExistentePorCampo('usuario', usuario),
                AuthModel.verificarUsuarioExistentePorCampo('email', email)
            ]);

            // Mensagens de erro específicas
            let mensagemErro = null;
            
            if (cpfExistente) {
                mensagemErro = "Já existe uma conta cadastrada com este CPF! Por favor, use outro CPF.";
            } else if (usuarioExistente) {
                mensagemErro = "Nome de usuário já está em uso! Por favor, escolha outro nome de usuário.";
            } else if (emailExistente) {
                mensagemErro = "E-mail já está cadastrado! Por favor, use outro e-mail.";
            }

            if (mensagemErro) {
                console.log('❌', mensagemErro);
                return res.render("auth/criar_conta", { 
                    error: mensagemErro,
                    success: null,
                    nome, 
                    usuario: usuarioExistente ? '' : usuario,
                    email: emailExistente ? '' : email,
                    turma, 
                    cpf: cpfExistente ? '' : cpf
                });
            }

            // Criar hash da senha e palavra-chave
            console.log('🔐 Criando hash da senha...');
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);
            const palavraChaveHash = await bcrypt.hash(palavraChave, saltRounds);

            // Dados para salvar no banco
            const dadosUsuario = {
                nome_completo: nome,
                usuario: usuario,
                email: email,
                senha: senhaHash,
                cpf: cpfLimpo, // Salvar sem formatação
                palavra_chave: palavraChaveHash,
                turma: turma,
                tipo: 'usuario',
                status: 'aprovado'
            };

            console.log('💾 Dados para salvar:', { 
                ...dadosUsuario, 
                senha: '***', 
                palavra_chave: '***' 
            });

            // Salvar no banco
            console.log('💾 Salvando no banco...');
            const resultado = await AuthModel.criarUsuario(dadosUsuario);
            
            console.log('✅ Usuário criado com ID:', resultado.insertId);

            res.render("auth/criar_conta", { 
                error: null, 
                success: "Conta criada com sucesso! Agora faça login para acessar o sistema.",
                nome: '', usuario: '', email: '', turma: '', cpf: ''
            });

        } catch (error) {
            console.error('💥 Erro completo ao criar conta:', error);
            
            let mensagemErro = "Erro ao processar solicitação. Tente novamente.";
            
            // Verificar se é erro de duplicidade do MySQL
            if (error.code === 'ER_DUP_ENTRY') {
                if (error.sqlMessage.includes('usuario')) {
                    mensagemErro = "Nome de usuário já está em uso!";
                } else if (error.sqlMessage.includes('email')) {
                    mensagemErro = "E-mail já está cadastrado!";
                } else if (error.sqlMessage.includes('cpf')) {
                    mensagemErro = "CPF já está cadastrado!";
                }
            }
            
            res.render("auth/criar_conta", { 
                error: mensagemErro,
                success: null,
                nome: req.body.nome, 
                usuario: req.body.usuario,
                email: req.body.email, 
                turma: req.body.turma,
                cpf: req.body.cpf
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
                            turma: user.turma
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