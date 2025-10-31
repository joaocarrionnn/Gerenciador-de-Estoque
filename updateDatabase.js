const db = require('./config/database');

// Atualizar tipos de usuário
db.query(`
    UPDATE usuarios 
    SET tipo = 'admin' 
    WHERE usuario = 'admin' OR id_usuario = 1
`, (err, result) => {
    if (err) {
        console.error('Erro ao atualizar tipos de usuário:', err);
    } else {
        console.log('Tipos de usuário atualizados com sucesso');
    }
});

// Verificar estrutura da tabela
db.query(`
    SELECT id_usuario, usuario, nome_completo, tipo 
    FROM usuarios
`, (err, results) => {
    if (err) {
        console.error('Erro ao verificar usuários:', err);
    } else {
        console.log('Usuários no sistema:');
        results.forEach(user => {
            console.log(`- ${user.usuario} (${user.nome_completo}): ${user.tipo}`);
        });
    }
    process.exit();
});