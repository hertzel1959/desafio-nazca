const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Configurando transporter de email...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Email config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '****' : 'NO CONFIGURADA'
});

class EmailService {
    constructor() {
        console.log('🔧 Inicializando EmailService...');
        console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
        
        // Crear transporter siempre, pero con manejo de errores mejorado
        try {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT),
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            console.log('✅ Transporter creado exitosamente');
        } catch (error) {
            console.error('❌ Error creando transporter:', error);
            this.transporter = null;
        }
    }

    async enviarCodigoVerificacion(email, codigo, datosInscripcion) {
        try {
            console.log('\n🔄 ================================');
            console.log('🔄 INICIANDO ENVÍO DE CÓDIGO');
            console.log('🔄 ================================');
            console.log(`📧 Para: ${email}`);
            console.log(`🔢 Código: ${codigo}`);
            console.log(`👤 Participante: ${datosInscripcion.nombres} ${datosInscripcion.apellidos}`);
            console.log(`🏁 Tipo: ${datosInscripcion.tripulante}`);
            console.log(`📻 Grupo: ${datosInscripcion.grupo}`);
            console.log('🔄 ================================');

            // Verificar si el transporter existe
            if (!this.transporter) {
                console.error('❌ Transporter no disponible');
                throw new Error('Transporter no configurado');
            }

            // Verificar conexión antes de enviar
            console.log('🔍 Verificando conexión SMTP...');
            await this.transporter.verify();
            console.log('✅ Conexión SMTP verificada');

            const htmlTemplate = this.getHtmlTemplate(codigo, datosInscripcion);
            
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: `🏜️ Código de Verificación - Desafío Dunas de Nazca`,
                html: htmlTemplate,
                text: `Hola ${datosInscripcion.nombres}!\n\nTu código de verificación para Desafío Dunas de Nazca es: ${codigo}\n\nEste código es válido por 10 minutos.\n\nSaludos,\nEquipo Dunas de Nazca`
            };

            console.log('📤 Enviando email...');
            console.log('📤 Opciones:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
            });

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado exitosamente:', info.messageId);
            console.log('✅ Info completa:', info);
            
            return { 
                success: true, 
                messageId: info.messageId,
                message: 'Email enviado exitosamente' 
            };

        } catch (error) {
            console.error('❌ Error detallado enviando email:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error command:', error.command);
            
            // En producción, también fallar pero con más info
            throw new Error(`Error enviando email: ${error.message} (Code: ${error.code})`);
        }
    }

    async enviarConfirmacionInscripcion(email, datosCompletos) {
        try {
            console.log('\n🎉 ================================');
            console.log('🎉 ENVIANDO CONFIRMACIÓN');
            console.log('🎉 ================================');
            console.log(`📧 Para: ${email}`);
            console.log(`🔢 Inscripción: ${datosCompletos.N_equipo}`);
            console.log(`👤 Participante: ${datosCompletos.nombres} ${datosCompletos.apellidos}`);
            console.log(`📻 Grupo: ${datosCompletos.grupo}`);
            console.log(`🏁 Estado: ${datosCompletos.estado}`);
            console.log('🎉 ================================');

            if (!this.transporter) {
                throw new Error('Transporter no configurado para confirmación');
            }

            const htmlTemplate = this.getConfirmacionTemplate(datosCompletos);
            
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: `✅ Inscripción Confirmada - Desafío Dunas de Nazca #${datosCompletos.N_equipo}`,
                html: htmlTemplate,
                text: `¡Inscripción Confirmada!\n\nHola ${datosCompletos.nombres},\n\nTu inscripción #${datosCompletos.N_equipo} al Desafío Dunas de Nazca 2025 ha sido confirmada.\n\n¡Nos vemos en las dunas!\n\nEquipo Dunas de Nazca`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email de confirmación enviado:', info.messageId);
            
            return { 
                success: true, 
                messageId: info.messageId,
                message: 'Email de confirmación enviado' 
            };

        } catch (error) {
            console.error('❌ Error enviando email de confirmación:', error);
            throw new Error(`Error enviando confirmación: ${error.message}`);
        }
    }

    async verificarConexion() {
        try {
            console.log('🔍 Verificando conexión del servicio de email...');
            
            if (!this.transporter) {
                console.error('❌ Transporter no disponible');
                return false;
            }

            await this.transporter.verify();
            console.log('✅ Servicio de email conectado correctamente');
            return true;
            
        } catch (error) {
            console.error('❌ Error conectando servicio de email:', error);
            console.error('❌ Error details:', {
                code: error.code,
                command: error.command,
                response: error.response
            });
            return false;
        }
    }

    getHtmlTemplate(codigo, datosInscripcion) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #8b5a3c 0%, #a0764d 100%); 
                             color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
                    .codigo { background: #f8fafc; border: 2px solid #8b5a3c; padding: 20px; 
                             text-align: center; margin: 20px 0; border-radius: 8px; }
                    .codigo-numero { font-size: 32px; font-weight: bold; color: #8b5a3c; 
                                   letter-spacing: 8px; font-family: monospace; }
                    .datos-inscripcion { background: #f0f9ff; padding: 20px; border-radius: 8px; 
                                       border-left: 4px solid #3182ce; margin: 20px 0; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; 
                             border-radius: 0 0 12px 12px; color: #718096; font-size: 14px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; 
                              border-radius: 8px; margin: 20px 0; color: #856404; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏜️ Desafío Dunas de Nazca 2025</h1>
                        <p>Verificación de Inscripción</p>
                    </div>
                    
                    <div class="content">
                        <h2>¡Hola ${datosInscripcion.nombres}!</h2>
                        
                        <p>Gracias por inscribirte al <strong>Desafío Dunas de Nazca 2025</strong>. 
                           Para completar tu inscripción, necesitamos verificar tu email.</p>
                        
                        <div class="codigo">
                            <h3>Tu código de verificación es:</h3>
                            <div class="codigo-numero">${codigo}</div>
                            <p><small>Este código es válido por 10 minutos</small></p>
                        </div>
                        
                        <div class="datos-inscripcion">
                            <h4>📋 Resumen de tu inscripción:</h4>
                            <ul>
                                <li><strong>Participante:</strong> ${datosInscripcion.nombres} ${datosInscripcion.apellidos}</li>
                                <li><strong>Tipo:</strong> ${datosInscripcion.tripulante}</li>
                                <li><strong>Grupo:</strong> ${datosInscripcion.grupo}</li>
                                <li><strong>Vehículo:</strong> ${datosInscripcion.tipoVehiculo} ${datosInscripcion.marca} ${datosInscripcion.modelo}</li>
                                <li><strong>Llegada:</strong> ${datosInscripcion.diaLlegada}</li>
                            </ul>
                        </div>
                        
                        <p>Nos vemos en las dunas de Nazca del <strong>29 al 31 de Agosto 2025</strong>!</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Desafío Dunas de Nazca</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    getConfirmacionTemplate(datosCompletos) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); 
                             color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                    .content { background: white; padding: 30px; border: 1px solid #e2e8f0; }
                    .success-badge { background: #f0fff4; border: 2px solid #48bb78; padding: 20px; 
                                   text-align: center; margin: 20px 0; border-radius: 12px; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; 
                             border-radius: 0 0 12px 12px; color: #718096; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 ¡Inscripción Confirmada!</h1>
                        <p>Desafío Dunas de Nazca 2025</p>
                    </div>
                    
                    <div class="content">
                        <div class="success-badge">
                            <h2 style="color: #22543d; margin: 0;">✅ ¡Bienvenido al desafío!</h2>
                            <p style="margin: 10px 0 0 0; color: #22543d;">Tu inscripción ha sido confirmada exitosamente</p>
                        </div>
                        
                        <h3>Hola ${datosCompletos.nombres} ${datosCompletos.apellidos},</h3>
                        <p>¡Felicidades! Tu inscripción #${datosCompletos.N_equipo} al <strong>Desafío Dunas de Nazca 2025</strong> ha sido confirmada.</p>
                        
                        <p>¡Nos vemos en las dunas para vivir una aventura inolvidable!</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Desafío Dunas de Nazca | Inscripción #${datosCompletos.N_equipo}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

module.exports = new EmailService();