const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const bcrypt = require('bcrypt');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.middlewares();
        this.routes();
        this.listen();
        //this.conectarBD();
    }

    //conectarBD() {
      //  this.con = mysql.createPool({
        //    host: "localhost",
          //  user: "root",
            //password: "Tito4ban2iris1",
           // database: "usuariosbd",
        //});
    //}

    middlewares() {
        this.app.use(express.static('./public'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.set('view engine', 'ejs');
        this.app.set('trust proxy');
        this.app.use(session({
            secret: "clave",
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false }
        }));
    }

    routes() {
        this.app.get('/indexA', (req, res) => {
            let usuario = req.session.usuario;
            let rol = req.session.rol;

            if (req.session.usuario) {
                if (req.session.rol == "admi") {
                    res.render('indexA', { usuario: usuario, rol: rol });
                } else if (req.session.rol == "general") {
                    res.render('indexA', { usuario: usuario, rol: rol });
                }
            } else {
                res.render('error', { mensaje: "No iniciaste sesión" });
            }
        });

        this.app.get('/hola', (req, res) => {
            if (req.session.usuario) {
                res.send('hola ' + req.session.usuario);
            } else {
                res.send('No iniciaste sesión');
            }
        });

        this.app.post("/login", (req, res) => {
            const user = req.body.usuario;
            const cont = req.body.cont;

            console.log("Ruta login...");
            console.log(user, cont);

            this.con.query("SELECT * FROM users WHERE usuario = ?", [user], (err, result) => {
                if (err) throw err;

                if (result.length > 0) {
                    const hashedPassword = result[0].cont;

                    if (bcrypt.compareSync(cont, hashedPassword)) {
                        console.log('Credenciales correctas');
                        req.session.usuario = user;
                        req.session.rol = result[0].rol;
                        res.render("index", { usuario: user, rol: result[0].rol });
                    } else {
                        console.log('Contraseña incorrecta');
                        res.render('error', { mensaje: "Contraseña incorrecta" });
                    }
                } else {
                    console.log('Usuario no existe');
                    res.render('error', { mensaje: "Usuario o contraseña incorrectos" });
                }
            });
        });

        this.app.post('/registrar', (req, res) => {
            const user = req.body.usuario;
            const cont = req.body.cont;

            // Cifrar la contraseña
            const salt = bcrypt.genSaltSync(12);
            const hashedCont = bcrypt.hashSync(cont, salt);

            const datos = [user, hashedCont, 'general'];
            const sql = "INSERT INTO users (usuario, cont, rol) VALUES (?, ?, ?)";

            this.con.query(sql, datos, (err) => {
                if (err) throw err;
                console.log("Usuario guardado");
                res.redirect('/login');
            });
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Servidor escuchando en: http://127.0.0.1:${this.port}`);
        });
    }
}

module.exports = Server;

