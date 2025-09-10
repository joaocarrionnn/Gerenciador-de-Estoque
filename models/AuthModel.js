const db = require('../config/database');

class AuthModel {
    static verificarUsuario(username) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Buscando usuário:', username);
            const query = "SELECT * FROM usuarios WHERE (usuario = ? OR email = ?) AND status = 'aprovado'";
            
            db.query(query, [username, username], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (verificarUsuario):', err.message);
                    console.error('SQL:', query);
                    return reject(err);
                }
                console.log('📋 Resultados encontrados:', results.length);
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    static verificarUsuarioExistente(email) {
        return new Promise((resolve, reject) => {
            console.log('🔍 Verificando se email existe:', email);
            const query = "SELECT * FROM usuarios WHERE email = ?";
            
            db.query(query, [email], (err, results) => {
                if (err) {
                    console.error('❌ Erro no SQL (verificarUsuarioExistente):', err.message);
                    return reject(err);
                }
                console.log('📋 Email já existe?', results.length > 0);
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
}

module.exports = AuthModel;