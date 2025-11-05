const db = require('../config/database');

class AuthModel {
    static verificarUsuario(username) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Buscando usuário:', username);
            // ADICIONE foto_perfil NA QUERY
            const query = "SELECT id_usuario, usuario, nome_completo, email, senha, tipo, turma, foto_perfil, status FROM usuarios WHERE (usuario = ? OR email = ?) AND status = 'aprovado'";
            
            db.query(query, [username, username], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (verificarUsuario):', err.message);
                    console.error('SQL:', query);
                    return reject(err);
                }
                console.log('📋 Resultados encontrados:', results.length);
                if (results.length > 0) {
                    console.log('📸 Foto do perfil encontrada:', results[0].foto_perfil);
                }
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    static verificarUsuarioExistente(usuario, email, cpf) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando se usuário/email/cpf existe:', usuario, email, cpf);
            const query = "SELECT * FROM usuarios WHERE usuario = ? OR email = ? OR cpf = ?";
            
            db.query(query, [usuario, email, cpf], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (verificarUsuarioExistente):', err.message);
                    return reject(err);
                }
                console.log('📋 Usuário/Email/CPF já existe?', results.length > 0);
                resolve(results);
            });
        });
    }

    static verificarCPFExistente(cpf) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando CPF:', cpf);
            const query = "SELECT * FROM usuarios WHERE cpf = ?";
            
            db.query(query, [cpf], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (verificarCPFExistente):', err.message);
                    return reject(err);
                }
                console.log('📋 CPF já existe?', results.length > 0);
                resolve(results.length > 0);
            });
        });
    }

    static verificarUsuarioExistentePorCampo(campo, valor) {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Verificando ${campo}:`, valor);
            const query = `SELECT * FROM usuarios WHERE ${campo} = ?`;
            
            db.query(query, [valor], (err, results) => {
                if (err) {
                    console.error(`❌ Erro no SQL (verificar${campo}Existente):`, err.message);
                    return reject(err);
                }
                console.log(`📋 ${campo} já existe?`, results.length > 0);
                resolve(results.length > 0);
            });
        });
    }

    static criarUsuario(dados) {
        return new Promise((resolve, reject) => {
            console.log('💾 Tentando criar usuário:', dados);
            const query = "INSERT INTO usuarios SET ?";
            
            db.query(query, [dados], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (criarUsuario):', err.message);
                    console.error('Dados:', dados);
                    return reject(err);
                }
                console.log('✅ Usuário criado com ID:', results.insertId);
                resolve(results);
            });
        });
    }

    static verificarDadosRecuperacao(usuario, cpf, palavraChave) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando dados para recuperação:', { usuario, cpf });
            
            // Limpar formatação do CPF
            const cpfLimpo = cpf.replace(/\D/g, '');
            
            const query = `
                SELECT id_usuario, usuario, nome_completo, email, palavra_chave 
                FROM usuarios 
                WHERE usuario = ? AND cpf = ? AND status = 'aprovado'
            `;
            
            db.query(query, [usuario, cpfLimpo], (err, results) => {
                if (err) {
                    console.error('❌ Erro ao verificar dados recuperação:', err);
                    return reject(err);
                }
                
                if (results.length === 0) {
                    console.log('❌ Usuário não encontrado ou CPF incorreto');
                    return resolve(null);
                }
                
                const usuarioEncontrado = results[0];
                console.log('✅ Usuário encontrado para recuperação:', usuarioEncontrado.usuario);
                resolve(usuarioEncontrado);
            });
        });
    }
    
    static atualizarSenha(idUsuario, novaSenhaHash) {
        return new Promise((resolve, reject) => {
            console.log('🔐 Atualizando senha para usuário:', idUsuario);
            
            const query = `
                UPDATE usuarios 
                SET senha = ?, data_atualizacao = NOW() 
                WHERE id_usuario = ?
            `;
            
            db.query(query, [novaSenhaHash, idUsuario], (err, results) => {
                if (err) {
                    console.error('❌ Erro ao atualizar senha:', err);
                    return reject(err);
                }
                
                console.log('✅ Senha atualizada com sucesso');
                resolve(results);
            });
        });
    }
}

module.exports = AuthModel;