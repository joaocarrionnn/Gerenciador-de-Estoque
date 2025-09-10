const mysql = require('mysql2');

// Configuração do banco de dados
const dbConfig = {
    host: "localhost",
    user: "root", 
    password: "", 
    database: "sistema_estoque"
};

// Criar conexão
const connection = mysql.createConnection(dbConfig);

// Conectar ao banco
connection.connect((err) => {
    if (err) {
        console.error('❌ Erro ao conectar com o MySQL:', err.message);
        console.log('📋 Verifique:');
        console.log('1. MySQL está rodando?');
        console.log('2. Banco "sistema_estoque" existe?');
        console.log('3. Usuário e senha estão corretos?');
    } else {
        console.log('✅ Conectado ao MySQL com sucesso!');
        console.log('📊 Banco de dados: sistema_estoque');
    }
});

// Manipular erros de conexão
connection.on('error', (err) => {
    console.error('❌ Erro na conexão MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('🔄 Tentando reconectar...');
        connection.connect();
    } else {
        throw err;
    }
});

module.exports = connection;