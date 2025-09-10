const db = require('../config/database');

class PerfilModel {
    static async buscarPorId(id) {
        return new Promise((resolve, reject) => {
            db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    static async atualizar(id, dados) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE usuarios SET ? WHERE id_usuario = ?", [dados, id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    static async atualizarFoto(id, photoUrl) {
        return new Promise((resolve, reject) => {
            db.query("UPDATE usuarios SET foto = ? WHERE id_usuario = ?", [photoUrl, id], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }
}

module.exports = PerfilModel;