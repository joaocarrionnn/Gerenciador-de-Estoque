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
        
        console.log('🔐 Tentativa de login com usuário:', username);
        
        AuthModel.verificarUsuario(username)
            .then(user => {
                if (!user) {
                    console.log('❌ Usuário não encontrado');
                    return res.render("auth/login", { 
                        error: "Usuário não encontrado!",
                        username: username
                    });
                }

                console.log('✅ Usuário encontrado:', user.usuario);
                console.log('📸 Foto do perfil no banco:', user.foto_perfil);
                
                // Comparar senha
                bcrypt.compare(password, user.senha)
                    .then(match => {
                        if (!match) {
                            console.log('❌ Senha incorreta');
                            return res.render("auth/login", { 
                                error: "Senha incorreta!",
                                username: username
                            });
                        }

                        console.log('🎉 Login bem-sucedido para:', user.usuario);
                        
                        //  SESSÃO COMPLETA PARA TODOS OS USUÁRIOS 
                        req.session.user = {
                            id: user.id_usuario,
                            usuario: user.usuario,
                            nome: user.nome_completo,
                            email: user.email,
                            tipo: user.tipo, // 'admin' ou 'usuario'
                            turma: user.turma,
                            foto_perfil: user.foto_perfil || null //  GARANTIR que existe
                        };

                        console.log('📋 Dados da sessão criados:', {
                            id: req.session.user.id,
                            usuario: req.session.user.usuario,
                            tipo: req.session.user.tipo,
                            foto_perfil: req.session.user.foto_perfil
                        });

                        //  REDIRECIONAMENTO CORRETO 
                        console.log('🔄 Redirecionando para a página inicial...');
                        res.redirect("/");
                    })
                    .catch(err => {
                        console.error('💥 Erro ao comparar senha:', err);
                        res.render("auth/login", { 
                            error: "Erro no servidor durante a autenticação",
                            username: username
                        });
                    });
            })
            .catch(err => {
                console.error('💥 Erro ao buscar usuário:', err);
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

    // Processar verificação de identidade para recuperação de senha
    static async processarVerificacaoIdentidade(req, res) {
        try {
            const { usuario, cpf, palavraChave } = req.body;
            
            console.log('🔍 Processando verificação de identidade:', { usuario, cpf });
            
            // Validações básicas
            if (!usuario || !cpf || !palavraChave) {
                return res.render("auth/recuperar_senha", { 
                    error: "Todos os campos são obrigatórios!",
                    success: null
                });
            }

            // Verificar se CPF tem formato válido
            const cpfLimpo = cpf.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                return res.render("auth/recuperar_senha", { 
                    error: "CPF inválido! Digite um CPF com 11 dígitos.",
                    success: null
                });
            }

            // Buscar usuário no banco
            const usuarioEncontrado = await AuthModel.verificarDadosRecuperacao(usuario, cpf, palavraChave);
            
            if (!usuarioEncontrado) {
                return res.render("auth/recuperar_senha", { 
                    error: "Dados incorretos! Verifique o usuário, CPF e palavra-chave.",
                    success: null
                });
            }

            // Verificar palavra-chave
            const palavraChaveCorreta = await bcrypt.compare(palavraChave, usuarioEncontrado.palavra_chave);
            
            if (!palavraChaveCorreta) {
                return res.render("auth/recuperar_senha", { 
                    error: "Palavra-chave incorreta!",
                    success: null
                });
            }

            // Se chegou aqui, a verificação foi bem-sucedida
            // Armazenar o ID do usuário na sessão para a próxima etapa
            req.session.recuperacaoUsuarioId = usuarioEncontrado.id_usuario;
            req.session.recuperacaoUsuario = usuarioEncontrado.usuario;

            console.log('✅ Identidade verificada com sucesso para:', usuarioEncontrado.usuario);

            res.render("auth/recuperar_senha", { 
                error: null, 
                success: null,
                etapa: 'redefinir', // Indica que deve mostrar o formulário de nova senha
                usuario: usuarioEncontrado.usuario
            });

        } catch (error) {
            console.error('💥 Erro ao verificar identidade:', error);
            res.render("auth/recuperar_senha", { 
                error: "Erro ao processar verificação. Tente novamente.",
                success: null
            });
        }
    }

    // Processar redefinição de senha
    static async processarRedefinicaoSenha(req, res) {
        try {
            const { novaSenha, confirmarSenha } = req.body;
            
            console.log('🔐 Processando redefinição de senha');

            // Verificar se há sessão de recuperação ativa
            if (!req.session.recuperacaoUsuarioId) {
                console.log('❌ Sessão de recuperação não encontrada');
                return res.redirect('/auth/recuperar-senha');
            }

            // Validações
            if (!novaSenha || !confirmarSenha) {
                return res.render("auth/recuperar_senha", { 
                    error: "Preencha ambos os campos de senha!",
                    success: null,
                    etapa: 'redefinir',
                    usuario: req.session.recuperacaoUsuario
                });
            }

            if (novaSenha !== confirmarSenha) {
                return res.render("auth/recuperar_senha", { 
                    error: "As senhas não coincidem!",
                    success: null,
                    etapa: 'redefinir',
                    usuario: req.session.recuperacaoUsuario
                });
            }

            if (novaSenha.length < 6) {
                return res.render("auth/recuperar_senha", { 
                    error: "A senha deve ter pelo menos 6 caracteres!",
                    success: null,
                    etapa: 'redefinir',
                    usuario: req.session.recuperacaoUsuario
                });
            }

            // Criar hash da nova senha
            const saltRounds = 10;
            const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

            // Atualizar senha no banco
            await AuthModel.atualizarSenha(req.session.recuperacaoUsuarioId, novaSenhaHash);

            console.log('✅ Senha redefinida com sucesso para:', req.session.recuperacaoUsuario);

            // Limpar sessão de recuperação
            delete req.session.recuperacaoUsuarioId;
            delete req.session.recuperacaoUsuario;

            res.render("auth/recuperar_senha", { 
                error: null, 
                success: "Senha redefinida com sucesso! Agora você pode fazer login com sua nova senha.",
                etapa: 'concluido'
            });

        } catch (error) {
            console.error('💥 Erro ao redefinir senha:', error);
            res.render("auth/recuperar_senha", { 
                error: "Erro ao redefinir senha. Tente novamente.",
                success: null,
                etapa: 'redefinir',
                usuario: req.session.recuperacaoUsuario
            });
        }
    }
}

module.exports = AuthController;