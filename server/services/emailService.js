// services/emailService.js

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initialized = false;
        this.initTransporter();
    }

    initTransporter() {
        try {
            // 🎯 CONFIGURACIÓN PARA GMAIL (más común)
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                this.transporter = nodemailer.createTransporter({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS // App Password, no contraseña normal
                    }
                });
                console.log('✅ EmailService: Transporter de Gmail configurado');
            }
            
            // 🎯 CONFIGURACIÓN SMTP GENÉRICA (si no es Gmail)
            else if (process.env.SMTP_HOST) {
                this.transporter = nodemailer.createTransporter({
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_PORT === '465',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
                console.log('✅ EmailService: Transporter SMTP configurado');
            }
            
            // 🎯 MODO DESARROLLO - Ethereal Email (testing)
            else {
                console.log('⚠️ EmailService: Creando transporter de prueba...');
                this.createTestTransporter();
                return;
            }

            this.initialized = true;
            this.verifyConnection();
            
        } catch (error) {
            console.error('❌ Error inicializando EmailService:', error);
            this.createTestTransporter();
        }
    }

    async createTestTransporter() {
        try {
            const testAccount = await nodemailer.createTestAccount();
            
            this.transporter = nodemailer.createTransporter({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            
            this.initialized = true;
            console.log('✅ EmailService: Transporter de prueba creado');
            console.log('📧 Usuario de prueba:', testAccount.user);
            
        } catch (error) {
            console.error('❌ Error creando transporter de prueba:', error);
            this.initialized = false;
        }
    }

    async verifyConnection() {
        if (!this.transporter) return false;
        
        try {
            await this.transporter.verify();
            console.log('✅ EmailService: Conexión verificada');
            return true;
        } catch (error) {
            console.error('❌ EmailService: Error de conexión:', error);
            return false;
        }
    }

    async enviarCodigoVerificacion(email, codigo, datosInscripcion) {
        if (!this.isReady()) {
            throw new Error('Servicio de email no disponible');
        }

        try {
            const mailOptions = {
                from: `"Desafío Dunas de Nazca 2025" <${process.env.EMAIL_FROM || 'noreply@dunasnazca.com'}>`,
                to: email,
                subject: '🏜️ Código de Verificación - Dunas de Nazca 2025',
                html: this.getCodigoTemplate(codigo, datosInscripcion)
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Código enviado a:', email);
            console.log('📧 Message ID:', info.messageId);
            
            // Si es ethereal, mostrar preview URL
            if (info.preview) {
                console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
            }
            
            return {
                success: true,
                messageId: info.messageId,
                preview: info.preview ? nodemailer.getTestMessageUrl(info) : null
            };
            
        } catch (error) {
            console.error('❌ Error enviando código:', error);
            throw new Error(`Error enviando email: ${error.message}`);
        }
    }

    async enviarConfirmacionInscripcion(email, inscripcionData) {
        if (!this.isReady()) {
            throw new Error('Servicio de email no disponible');
        }

        try {
            const mailOptions = {
                from: `"Desafío Dunas de Nazca 2025" <${process.env.EMAIL_FROM || 'noreply@dunasnazca.com'}>`,
                to: email,
                subject: '🎉 Inscripción Confirmada - Dunas de Nazca 2025',
                html: this.getConfirmacionTemplate(inscripcionData)
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Confirmación enviada a:', email);
            console.log('📧 Message ID:', info.messageId);
            
            return {
                success: true,
                messageId: info.messageId,
                preview: info.preview ? nodemailer.getTestMessageUrl(info) : null
            };
            
        } catch (error) {
            console.error('❌ Error enviando confirmación:', error);
            throw new Error(`Error enviando confirmación: ${error.message}`);
        }
    }

    isReady() {
        const ready = this.initialized && this.transporter !== null;
        if (!ready) {
            console.error('❌ EmailService no está listo');
        }
        return ready;
    }

    getCodigoTemplate(codigo, datosInscripcion) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Código de Verificación</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D2691E, #CD853F); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🏜️ Dunas de Nazca 2025</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Código de Verificación</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                <h2 style="color: #D2691E; margin-top: 0;">¡Hola ${datosInscripcion.nombres}!</h2>
                
                <p>Para completar tu inscripción al <strong>Desafío Dunas de Nazca 2025</strong>, necesitas verificar tu email con el siguiente código:</p>
                
                <div style="background: #f8f9fa; border: 2px solid #D2691E; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                    <h3 style="color: #D2691E; margin: 0 0 10px 0;">Tu Código de Verificación:</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #D2691E; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                        ${codigo}
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Este código expira en 10 minutos</p>
                </div>
                
                <p><strong>Detalles de tu inscripción:</strong></p>
                <ul style="background: #f8f9fa; padding: 15px; border-radius: 5px; list-style: none;">
                    <li>👤 <strong>Participante:</strong> ${datosInscripcion.nombres} ${datosInscripcion.apellidos}</li>
                    <li>🏁 <strong>Tipo:</strong> ${datosInscripcion.tripulante}</li>
                    <li>📻 <strong>Grupo:</strong> ${datosInscripcion.grupo}</li>
                    <li>🏍️ <strong>Vehículo:</strong> ${datosInscripcion.marca} ${datosInscripcion.modelo}</li>
                </ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 25px;">
                    Si no solicitaste esta inscripción, puedes ignorar este email.
                </p>
            </div>
            
            <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; font-size: 14px;">
                    📅 <strong>Evento:</strong> 29-31 Agosto 2025 | 📍 <strong>Nazca, Perú</strong>
                </p>
            </div>
        </body>
        </html>
        `;
    }

    getConfirmacionTemplate(inscripcionData) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Inscripción Confirmada</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 28px;">🎉 ¡Inscripción Confirmada!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Dunas de Nazca 2025</p>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
                <h2 style="color: #48bb78; margin-top: 0;">¡Bienvenido al desafío, ${inscripcionData.nombres}!</h2>
                
                <p>Tu inscripción ha sido <strong>confirmada exitosamente</strong>. Aquí tienes todos los detalles:</p>
                
                <div style="background: #f0fff4; border: 2px solid #48bb78; border-radius: 10px; padding: 20px; margin: 25px 0;">
                    <h3 style="color: #22543d; margin: 0 0 15px 0;">📋 Datos de tu Inscripción:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>🔢 Número:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.N_equipo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>👤 Participante:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.nombres} ${inscripcionData.apellidos}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>🏁 Tipo:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.tripulante}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>📻 Grupo:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.grupo}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>📡 Frecuencia:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.frecuencia} MHz</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>🏍️ Vehículo:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.marca} ${inscripcionData.modelo} ${inscripcionData.año}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0; color: #22543d;"><strong>📅 Llegada:</strong></td>
                            <td style="padding: 5px 0;">${inscripcionData.diaLlegada}</td>
                        </tr>
                    </table>
                </div>
                
                <h3 style="color: #D2691E;">📍 Información del Evento:</h3>
                <ul style="background: #fff5f0; padding: 15px; border-radius: 5px; border-left: 4px solid #D2691E;">
                    <li>📅 <strong>Fechas:</strong> 29, 30, 31 de Agosto 2025</li>
                    <li>📍 <strong>Lugar:</strong> Dunas de Nazca, Perú</li>
                    <li>🎯 <strong>Destino:</strong> Cerro Marcha</li>
                    <li>📻 <strong>Tu frecuencia:</strong> ${inscripcionData.frecuencia} MHz</li>
                </ul>
                
                <h3 style="color: #D2691E;">📋 Próximos Pasos:</h3>
                <ol style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
                    <li>Prepara tu vehículo y equipo</li>
                    <li>Configura tu radio en ${inscripcionData.frecuencia} MHz</li>
                    <li>Mantente atento a futuras comunicaciones</li>
                    <li>¡Prepárate para la aventura!</li>
                </ol>
            </div>
            
            <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="margin: 0; font-size: 14px;">
                    🏜️ <strong>¡Nos vemos en las dunas!</strong><br>
                    Organizado por la Comunidad 4x4 con apoyo de la Municipalidad de Nazca
                </p>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new EmailService();