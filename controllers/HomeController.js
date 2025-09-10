class HomeController {
    static index(req, res) {
        res.render('home/index', { 
            user: { name: 'João Carrion', role: 'Administrador' } 
        });
    }
}

module.exports = HomeController;