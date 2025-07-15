// ===============================
// SERVICIO DE EMAIL - BACKEND
// ===============================

// 1. Instalar dependencias necesarias:
// npm install nodemailer dotenv

// 2. Crear archivo .env con tus credenciales:
/*
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password
EMAIL_FROM=tu-email@gmail.com
EMAIL_FROM_NAME=Desafío Dunas de Nazca
*/

// 3. Crear servicio de email (backend/services/emailService.js)
// ===============================
// EMAIL SERVICE - VERSIÓN COMPLETA PARA CommonJS
// ===============================
// Guardar como: server/services/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config();
console.log('📧 Configurando transporter de email...');
console.log('Email config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? '****' : 'NO CONFIGURADA'
});
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true para 465, false para otros puertos
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async enviarCodigoVerificacion(email, codigo, datosInscripcion) {
        const htmlTemplate = `
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
                        
                        <div class="warning">
                            <strong>⚠️ Importante:</strong><br>
                            • Ingresa este código en la página de verificación<br>
                            • No compartas este código con nadie<br>
                            • Si no solicitaste esta inscripción, ignora este email
                        </div>
                        
                        <p>Nos vemos en las dunas de Nazca del <strong>29 al 31 de Agosto 2025</strong>!</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Desafío Dunas de Nazca | Este email fue enviado porque te inscribiste al evento</p>
                        <p>Si tienes problemas, contacta: admin@dunasdenazca.pe</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `🏜️ Código de Verificación - Desafío Dunas de Nazca`,
            html: htmlTemplate,
            text: `Hola ${datosInscripcion.nombres}!\n\nTu código de verificación para Desafío Dunas de Nazca es: ${codigo}\n\nEste código es válido por 10 minutos.\n\nSaludos,\nEquipo Dunas de Nazca`
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email enviado:', info.messageId);
            return { 
                success: true, 
                messageId: info.messageId,
                message: 'Email enviado exitosamente' 
            };
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            throw new Error(`Error enviando email: ${error.message}`);
        }
    }

    async enviarConfirmacionInscripcion(email, datosCompletos) {
        const htmlTemplate = `
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
                    .datos-completos { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; }
                    .seccion { margin-bottom: 20px; }
                    .seccion h4 { color: #8b5a3c; margin-bottom: 10px; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; 
                             border-radius: 0 0 12px 12px; color: #718096; font-size: 14px; }
                    .importante { background: #fff3cd; border-left: 4px solid #f6ad55; 
                                padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
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
                        <p>¡Felicidades! Tu inscripción al <strong>Desafío Dunas de Nazca 2025</strong> ha sido confirmada.</p>
                        
                        <div class="datos-completos">
                            <div class="seccion">
                                <h4>📋 Datos de Inscripción:</h4>
                                <ul>
                                    <li><strong>Número de Inscripción:</strong> ${datosCompletos.N_equipo}</li>
                                    <li><strong>Tipo de Participante:</strong> ${datosCompletos.tripulante}</li>
                                    <li><strong>Estado:</strong> ${datosCompletos.estado}</li>
                                </ul>
                            </div>
                            
                            <div class="seccion">
                                <h4>📻 Información del Grupo:</h4>
                                <ul>
                                    <li><strong>Grupo:</strong> ${datosCompletos.grupo}</li>
                                    <li><strong>Frecuencia:</strong> ${datosCompletos.frecuencia} MHz</li>
                                    <li><strong>Líder del Grupo:</strong> ${datosCompletos.liderGrupo || 'Por asignar'}</li>
                                </ul>
                            </div>
                            
                            <div class="seccion">
                                <h4>🏍️ Vehículo Registrado:</h4>
                                <ul>
                                    <li><strong>Tipo:</strong> ${datosCompletos.tipoVehiculo}</li>
                                    <li><strong>Vehículo:</strong> ${datosCompletos.marca} ${datosCompletos.modelo}</li>
                                    <li><strong>Año:</strong> ${datosCompletos.año}</li>
                                </ul>
                            </div>
                            
                            <div class="seccion">
                                <h4>📅 Detalles del Evento:</h4>
                                <ul>
                                    <li><strong>Fechas:</strong> 29, 30 y 31 de Agosto 2025</li>
                                    <li><strong>Tu llegada:</strong> ${datosCompletos.diaLlegada}</li>
                                    <li><strong>Ubicación:</strong> Dunas de Nazca, Perú</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="importante">
                            <h4>📋 Próximos Pasos:</h4>
                            <ol>
                                <li>Mantén este email como comprobante de tu inscripción</li>
                                <li>Recibirás más información sobre el evento próximamente</li>
                                <li>Prepara tu vehículo y equipo de seguridad</li>
                                <li>Únete a nuestro grupo de WhatsApp (te enviaremos el enlace)</li>
                            </ol>
                        </div>
                        
                        <p>¡Nos vemos en las dunas para vivir una aventura inolvidable!</p>
                    </div>
                    
                    <div class="footer">
                        <p>© 2025 Desafío Dunas de Nazca | Inscripción #${datosCompletos.N_equipo}</p>
                        <p>Para consultas: admin@dunasdenazca.pe | WhatsApp: +51 987 654 321</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `✅ Inscripción Confirmada - Desafío Dunas de Nazca #${datosCompletos.N_equipo}`,
            html: htmlTemplate,
            text: `¡Inscripción Confirmada!\n\nHola ${datosCompletos.nombres},\n\nTu inscripción #${datosCompletos.N_equipo} al Desafío Dunas de Nazca 2025 ha sido confirmada.\n\nGrupo: ${datosCompletos.grupo}\nFrecuencia: ${datosCompletos.frecuencia} MHz\nLlegada: ${datosCompletos.diaLlegada}\n\n¡Nos vemos en las dunas!\n\nEquipo Dunas de Nazca`
        };

        try {
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

    // Verificar conexión del servicio
    async verificarConexion() {
        try {
            await this.transporter.verify();
            console.log('✅ Servicio de email conectado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error conectando servicio de email:', error);
            return false;
        }
    }
}

//module.exports = new EmailService();
// ===============================
// EMAIL SERVICE - MODO DEVELOPMENT
// Reemplazar temporalmente server/services/emailService.js
// ===============================
/*
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        // En desarrollo, crear transporter que no falle
        if (process.env.NODE_ENV === 'development') {
            console.log('📧 EmailService en modo desarrollo (sin envío real)');
            this.transporter = null; // No crear transporter real
        } else {
            this.transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        }
    }

    async enviarCodigoVerificacion(email, codigo, datosInscripcion) {
        try {
            if (process.env.NODE_ENV === 'development') {
                // ✅ MODO DESARROLLO: Simular envío exitoso
                console.log('\n🔧 ================================');
                console.log('🔧 MODO DESARROLLO - EMAIL SIMULADO');
                console.log('🔧 ================================');
                console.log(`📧 Para: ${email}`);
                console.log(`🔢 Código: ${codigo}`);
                console.log(`👤 Participante: ${datosInscripcion.nombres} ${datosInscripcion.apellidos}`);
                console.log(`🏁 Tipo: ${datosInscripcion.tripulante}`);
                console.log(`📻 Grupo: ${datosInscripcion.grupo}`);
                console.log('🔧 ================================\n');
                
                // Simular delay de envío
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return { 
                    success: true, 
                    messageId: 'dev-' + Date.now(),
                    message: 'Email simulado enviado exitosamente (modo desarrollo)' 
                };
            } else {
                // MODO PRODUCCIÓN: Envío real
                const htmlTemplate = this.getHtmlTemplate(codigo, datosInscripcion);
                
                const mailOptions = {
                    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                    to: email,
                    subject: `🏜️ Código de Verificación - Desafío Dunas de Nazca`,
                    html: htmlTemplate,
                    text: `Hola ${datosInscripcion.nombres}!\n\nTu código de verificación para Desafío Dunas de Nazca es: ${codigo}\n\nEste código es válido por 10 minutos.\n\nSaludos,\nEquipo Dunas de Nazca`
                };

                const info = await this.transporter.sendMail(mailOptions);
                console.log('✅ Email enviado:', info.messageId);
                return { 
                    success: true, 
                    messageId: info.messageId,
                    message: 'Email enviado exitosamente' 
                };
            }
        } catch (error) {
            console.error('❌ Error enviando email:', error);
            
            if (process.env.NODE_ENV === 'development') {
                // En desarrollo, no fallar por email
                console.log('⚠️ Error de email ignorado en desarrollo');
                return { 
                    success: true, 
                    messageId: 'dev-error-' + Date.now(),
                    message: 'Email simulado (error ignorado en desarrollo)' 
                };
            } else {
                throw new Error(`Error enviando email: ${error.message}`);
            }
        }
    }

    async enviarConfirmacionInscripcion(email, datosCompletos) {
        try {
            if (process.env.NODE_ENV === 'development') {
                // MODO DESARROLLO: Simular confirmación
                console.log('\n🔧 ================================');
                console.log('🔧 EMAIL DE CONFIRMACIÓN SIMULADO');
                console.log('🔧 ================================');
                console.log(`📧 Para: ${email}`);
                console.log(`🔢 Inscripción: ${datosCompletos.N_equipo}`);
                console.log(`👤 Participante: ${datosCompletos.nombres} ${datosCompletos.apellidos}`);
                console.log(`📻 Grupo: ${datosCompletos.grupo}`);
                console.log(`🏁 Estado: ${datosCompletos.estado}`);
                console.log('🔧 ================================\n');
                
                return { 
                    success: true, 
                    messageId: 'dev-confirm-' + Date.now(),
                    message: 'Email de confirmación simulado' 
                };
            } else {
                // MODO PRODUCCIÓN: Envío real
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
            }
        } catch (error) {
            console.error('❌ Error enviando email de confirmación:', error);
            
            if (process.env.NODE_ENV === 'development') {
                console.log('⚠️ Error de confirmación ignorado en desarrollo');
                return { 
                    success: true, 
                    messageId: 'dev-confirm-error-' + Date.now(),
                    message: 'Confirmación simulada (error ignorado)' 
                };
            } else {
                throw new Error(`Error enviando confirmación: ${error.message}`);
            }
        }
    }

    async verificarConexion() {
        try {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Servicio de email en modo desarrollo (simulado)');
                return true;
            } else {
                await this.transporter.verify();
                console.log('✅ Servicio de email conectado correctamente');
                return true;
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Email no configurado - usando modo simulado');
                return true; // No fallar en desarrollo
            } else {
                console.error('❌ Error conectando servicio de email:', error);
                return false;
            }
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

*/
module.exports = new EmailService();
