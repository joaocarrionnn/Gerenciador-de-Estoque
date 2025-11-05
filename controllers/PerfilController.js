const db = require('../config/database');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

class PerfilController {
    
    // Exibir página do perfil
    static async perfil(req, res) {
        try {
            const userId = req.session.user.id;
            
            console.log('📱 Carregando perfil para usuário ID:', userId);
            console.log('👤 Dados da sessão:', req.session.user);

            // Buscar dados completos do usuário
            const query = `
                SELECT 
                    id_usuario,
                    nome_completo,
                    usuario,
                    email,
                    turma,
                    tipo,
                    telefone,
                    foto_perfil,
                    data_criacao,
                    data_atualizacao
                FROM usuarios 
                WHERE id_usuario = ?
            `;
            
            db.query(query, [userId], (err, results) => {
                if (err) {
                    console.error('❌ Erro ao buscar dados do usuário:', err);
                    return res.status(500).render('error', { 
                        message: 'Erro ao carregar perfil',
                        user: req.session.user 
                    });
                }
                
                if (results.length === 0) {
                    console.error('❌ Usuário não encontrado ID:', userId);
                    return res.status(404).render('error', { 
                        message: 'Usuário não encontrado',
                        user: req.session.user 
                    });
                }
                
                const usuario = results[0];
                
                console.log('✅ Dados do usuário carregados do banco:', usuario.usuario);
                console.log('📸 Foto no banco:', usuario.foto_perfil);

                // Separar nome e sobrenome
                const nomeCompleto = usuario.nome_completo || '';
                const [nome, ...sobrenomeArray] = nomeCompleto.split(' ');
                const sobrenome = sobrenomeArray.join(' ') || '';
                
                // URL da foto de perfil -  CORREÇÃO AQUI 
                let fotoPerfilUrl = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(usuario.nome_completo || 'Usuário') + '&background=2c3e50&color=fff&size=128';
                if (usuario.foto_perfil) {
                    fotoPerfilUrl = '/uploads/profile-photos/' + usuario.foto_perfil;
                    console.log('🖼️ URL da foto:', fotoPerfilUrl);
                }
                
                // Calcular tempo como membro
                const dataCriacao = new Date(usuario.data_criacao);
                const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                const membroDesde = `${meses[dataCriacao.getMonth()]} ${dataCriacao.getFullYear()}`;
                
                console.log('🎨 Renderizando página de perfil...');
                
                //  RENDERIZAÇÃO DIRETA - SEM COMPLICAÇÕES 
                res.render('perfil', {
                    user: req.session.user, //  USAR DADOS DA SESSÃO 
                    usuario: {
                        ...usuario,
                        nome: nome,
                        sobrenome: sobrenome,
                        fotoPerfilUrl: fotoPerfilUrl,
                        membroDesde: membroDesde
                    },
                    estatisticas: {
                        totalReagentes: 0,
                        totalEntradas: 0,
                        totalSaidas: 0
                    },
                    success: req.query.success || null,
                    error: req.query.error || null
                });
            });
            
        } catch (error) {
            console.error('💥 Erro crítico no perfil:', error);
            res.status(500).render('error', { 
                message: 'Erro interno do servidor',
                user: req.session.user 
            });
        }
    }
    
    // Buscar estatísticas do usuário
    static buscarEstatisticas(userId) {
        return new Promise((resolve, reject) => {
            const queries = [
                // Total de produtos
                "SELECT COUNT(*) as total FROM produtos",
                // Total de entradas
                "SELECT COUNT(*) as total FROM movimentacoes WHERE tipo = 'entrada'",
                // Total de saídas
                "SELECT COUNT(*) as total FROM movimentacoes WHERE tipo = 'saida'"
            ];
            
            Promise.all([
                new Promise((res, rej) => db.query(queries[0], (err, results) => err ? rej(err) : res(results[0].total))),
                new Promise((res, rej) => db.query(queries[1], (err, results) => err ? rej(err) : res(results[0].total))),
                new Promise((res, rej) => db.query(queries[2], (err, results) => err ? rej(err) : res(results[0].total)))
            ])
            .then(([totalReagentes, totalEntradas, totalSaidas]) => {
                resolve({
                    totalReagentes: totalReagentes,
                    totalEntradas: totalEntradas,
                    totalSaidas: totalSaidas
                });
            })
            .catch(reject);
        });
    }
    
    // Upload de foto - VERSÃO COMPLETAMENTE CORRIGIDA
    static uploadFoto(req, res) {
        console.log('📸 === INICIANDO UPLOAD DE FOTO ===');
        
        // Verificar se há arquivo
        if (!req.file) {
            console.log('❌ Nenhum arquivo recebido no upload');
            return res.status(400).json({ 
                success: false, 
                message: 'Nenhuma imagem selecionada' 
            });
        }

        const userId = req.session.user.id;
        const nomeArquivo = req.file.filename;

        console.log('✅ Arquivo recebido:', nomeArquivo);
        console.log('👤 Usuário ID:', userId);
        console.log('📁 Caminho do arquivo:', req.file.path);

        //  ATUALIZAÇÃO DIRETA NO BANCO - SEM COMPLICAÇÕES 
        const updateQuery = "UPDATE usuarios SET foto_perfil = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_usuario = ?";
        
        db.query(updateQuery, [nomeArquivo, userId], (err, results) => {
            if (err) {
                console.error('❌ Erro no banco de dados:', err);
                
                // Tentar deletar o arquivo enviado em caso de erro
                try {
                    const fs = require('fs');
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                        console.log('🗑️ Arquivo deletado devido a erro no banco');
                    }
                } catch (fileError) {
                    console.error('❌ Erro ao deletar arquivo:', fileError);
                }
                
                return res.status(500).json({ 
                    success: false, 
                    message: 'Erro ao salvar foto no banco de dados' 
                });
            }

            console.log('✅ Foto salva no banco com sucesso!');
            console.log('📊 Linhas afetadas:', results.affectedRows);
            
            // Atualizar sessão do usuário
            if (req.session.user) {
                req.session.user.foto_perfil = nomeArquivo;
                console.log('🔄 Sessão atualizada com nova foto');
            }
            
            //  RESPOSTA SIMPLES E CLARA 
            res.json({ 
                success: true, 
                message: 'Foto atualizada com sucesso!',
                fotoUrl: '/uploads/profile-photos/' + nomeArquivo
            });
            
            console.log('📤 Resposta enviada para o cliente');
        });
    }
    
    // Atualizar perfil (MÉTODO PRINCIPAL)
    static async atualizarPerfil(req, res) {
        try {
            const userId = req.session.user.id;
            const { nome, sobrenome, email, telefone, turma } = req.body;
            
            console.log('📝 Iniciando atualização de perfil para usuário:', userId);
            console.log('📨 Dados recebidos:', { nome, sobrenome, email, telefone, turma });
            
            // Validações básicas
            if (!nome || !sobrenome || !email || !turma) {
                console.log('❌ Campos obrigatórios faltando');
                return res.redirect('/perfil?error=' + encodeURIComponent('Todos os campos obrigatórios devem ser preenchidos'));
            }
            
            // Validar formato do email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.log('❌ Email inválido');
                return res.redirect('/perfil?error=' + encodeURIComponent('Email inválido'));
            }
            
            const nomeCompleto = `${nome} ${sobrenome}`.trim();
            
            console.log('💾 Nome completo a ser salvo:', nomeCompleto);
            
            // Verificar se o email já está em uso por outro usuário
            const verificarEmailQuery = "SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?";
            db.query(verificarEmailQuery, [email, userId], (err, results) => {
                if (err) {
                    console.error('❌ Erro ao verificar email:', err);
                    return res.redirect('/perfil?error=' + encodeURIComponent('Erro ao verificar disponibilidade do email'));
                }
                
                if (results.length > 0) {
                    console.log('❌ Email já está em uso');
                    return res.redirect('/perfil?error=' + encodeURIComponent('Este email já está em uso por outro usuário'));
                }
                
                // Atualizar no banco de dados
                const updateQuery = `
                    UPDATE usuarios 
                    SET nome_completo = ?, email = ?, telefone = ?, turma = ?, data_atualizacao = CURRENT_TIMESTAMP 
                    WHERE id_usuario = ?
                `;
                
                db.query(updateQuery, [nomeCompleto, email, telefone, turma, userId], (err, results) => {
                    if (err) {
                        console.error('❌ Erro ao atualizar perfil no banco:', err);
                        return res.redirect('/perfil?error=' + encodeURIComponent('Erro ao atualizar perfil'));
                    }
                    
                    console.log('✅ Perfil atualizado com sucesso no banco');
                    console.log('📊 Resultado da atualização:', results);
                    
                    // Atualizar sessão do usuário
                    req.session.user.nome = nomeCompleto;
                    req.session.user.email = email;
                    req.session.user.turma = turma;
                    
                    console.log('🔄 Sessão do usuário atualizada');
                    
                    res.redirect('/perfil?success=' + encodeURIComponent('Perfil atualizado com sucesso!'));
                });
            });
            
        } catch (error) {
            console.error('💥 Erro ao atualizar perfil:', error);
            res.redirect('/perfil?error=' + encodeURIComponent('Erro interno do servidor'));
        }
    }
    
    // Alterar senha
    static alterarSenha(req, res) {
        try {
            const userId = req.session.user.id;
            const { senhaAtual, novaSenha, confirmarSenha } = req.body;
            
            console.log('🔐 Iniciando alteração de senha para usuário:', userId);
            
            // Validar se as senhas coincidem
            if (novaSenha !== confirmarSenha) {
                console.log('❌ Senhas não coincidem');
                return res.redirect('/perfil?error=' + encodeURIComponent('As senhas não coincidem'));
            }
            
            if (novaSenha.length < 6) {
                console.log('❌ Senha muito curta');
                return res.redirect('/perfil?error=' + encodeURIComponent('A senha deve ter pelo menos 6 caracteres'));
            }
            
            // Buscar usuário para verificar senha atual
            const buscarQuery = "SELECT senha FROM usuarios WHERE id_usuario = ?";
            db.query(buscarQuery, [userId], async (err, results) => {
                if (err) {
                    console.error('❌ Erro ao buscar usuário:', err);
                    return res.redirect('/perfil?error=' + encodeURIComponent('Erro ao alterar senha'));
                }
                
                if (results.length === 0) {
                    console.log('❌ Usuário não encontrado');
                    return res.redirect('/perfil?error=' + encodeURIComponent('Usuário não encontrado'));
                }
                
                const usuario = results[0];
                
                // Verificar senha atual
                const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
                if (!senhaCorreta) {
                    console.log('❌ Senha atual incorreta');
                    return res.redirect('/perfil?error=' + encodeURIComponent('Senha atual incorreta'));
                }
                
                // Criptografar nova senha
                const saltRounds = 10;
                const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);
                
                // Atualizar senha
                const updateQuery = "UPDATE usuarios SET senha = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id_usuario = ?";
                db.query(updateQuery, [novaSenhaHash, userId], (err, results) => {
                    if (err) {
                        console.error('❌ Erro ao atualizar senha:', err);
                        return res.redirect('/perfil?error=' + encodeURIComponent('Erro ao alterar senha'));
                    }
                    
                    console.log('✅ Senha alterada com sucesso');
                    res.redirect('/perfil?success=' + encodeURIComponent('Senha alterada com sucesso!'));
                });
            });
            
        } catch (error) {
            console.error('💥 Erro ao alterar senha:', error);
            res.redirect('/perfil?error=' + encodeURIComponent('Erro interno do servidor'));
        }
    }
}

module.exports = PerfilController;