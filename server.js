const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

// Simula una base de datos de usuarios
const users = [
    { id: 1, email: 'usuario@example.com', password: '$2a$10$7Mfx4LE6dE6BtCJ/9U1OcOKxz7IetOvGrTjkZtO7vlIueZkPMnL6C' }, // Contraseña: 123456
];

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tuemail@gmail.com',
        pass: 'tucontraseña',
    },
});

// Clave secreta para JWT
const SECRET_KEY = 'clave_secreta_para_tokens';

// Endpoint para solicitar restablecimiento de contraseña
app.post('/request-password-reset', (req, res) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    // Generar un token de restablecimiento
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });

    // Enviar el token por correo
    const mailOptions = {
        from: 'tuemail@gmail.com',
        to: email,
        subject: 'Restablecer contraseña',
        text: `Usa este enlace para restablecer tu contraseña: http://localhost:3000/reset-password/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send({ message: 'Error al enviar el correo' });
        }
        res.send({ message: 'Correo de restablecimiento enviado' });
    });
});

// Endpoint para restablecer la contraseña
app.post('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = users.find((u) => u.id === decoded.id);

        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Actualizar la contraseña
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        user.password = hashedPassword;

        res.send({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error(err);
        res.status(400).send({ message: 'Token inválido o expirado' });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log(`Servidor escuchando en: http://127.0.0.1:${this.port}`);
});
