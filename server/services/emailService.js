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
            this.transporter = nodemailer.createTransporter({
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

    async enviarConfirmacionInscripcion(email, inscripcionData) {
        try {
            console.log('\n🎉 ================================');
            console.log('🎉 ENVIANDO CONFIRMACIÓN');
            console.log('🎉 ================================');
            console.log(`📧 Para: ${email}`);
            console.log(`🔢 Inscripción: ${inscripcionData.N_equipo || inscripcionData.NRO}`);
            console.log(`👤 Participante: ${inscripcionData.nombres} ${inscripcionData.apellidos}`);
            console.log(`📻 Grupo: ${inscripcionData.grupo}`);
            console.log(`🏁 Estado: ${inscripcionData.estado}`);
            console.log('🎉 ================================');

            if (!this.transporter) {
                throw new Error('Transporter no configurado para confirmación');
            }

            // Preparar datos del participante
            const nombreCompleto = inscripcionData.nombreCompleto || 
                                   `${inscripcionData.nombres} ${inscripcionData.apellidos}`;
            
            const numeroInscripcion = inscripcionData.N_equipo || inscripcionData.NRO || 'Sin asignar';
            
            // HTML del email de confirmación COMPLETO
            const htmlTemplate = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                    
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #D2691E, #CD853F); padding: 30px; text-align: center;">
                        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; display: inline-block;">
                            <h1 style="color: white; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                🏜️ DESAFÍO DUNAS DE NAZCA 2025
                            </h1>
                            <p style="color: #FFE4B5; margin: 10px 0 0 0; font-size: 16px; font-weight: 600;">
                                ¡INSCRIPCIÓN CONFIRMADA!
                            </p>
                        </div>
                    </div>
                    
                    <!-- Contenido Principal -->
                    <div style="padding: 40px 30px;">
                        
                        <!-- Mensaje de Bienvenida -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
                            <h2 style="color: #2c3e50; margin: 0 0 10px 0;">¡Felicitaciones, ${nombreCompleto}!</h2>
                            <p style="color: #718096; font-size: 18px; margin: 0;">
                                Su inscripción al Desafío Dunas de Nazca 2025 ha sido <strong>confirmada exitosamente</strong>.
                            </p>
                        </div>
                        
                        <!-- Tarjeta de Inscripción -->
                        <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
                                    border: 3px solid #D2691E; border-radius: 15px; 
                                    padding: 25px; margin: 30px 0;">
                            <h3 style="color: #D2691E; margin: 0 0 20px 0; text-align: center; font-size: 22px;">
                                📋 DATOS DE SU INSCRIPCIÓN
                            </h3>
                            
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">🔢 Número de Inscripción:</strong>
                                    <span style="color: #D2691E; font-weight: 700; font-size: 18px;">${numeroInscripcion}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">👤 Participante:</strong>
                                    <span style="color: #2d3748; font-weight: 600;">${nombreCompleto}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">🏁 Tipo de Participante:</strong>
                                    <span style="color: #2d3748; text-transform: capitalize;">${inscripcionData.tripulante}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">📻 Grupo Asignado:</strong>
                                    <span style="color: #2d3748;">${inscripcionData.grupo || 'Por asignar'}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">📡 Frecuencia:</strong>
                                    <span style="color: #2d3748;">${inscripcionData.frecuencia ? inscripcionData.frecuencia + ' MHz' : 'Por asignar'}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">🏍️ Vehículo:</strong>
                                    <span style="color: #2d3748;">${inscripcionData.vehiculoCompleto || 
                                        (inscripcionData.marca + ' ' + inscripcionData.modelo + ' (' + inscripcionData.año + ')')}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #cbd5e0;">
                                    <strong style="color: #4a5568;">📅 Día de Llegada:</strong>
                                    <span style="color: #2d3748; text-transform: capitalize;">${inscripcionData.diaLlegada}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                    <strong style="color: #4a5568;">✅ Estado:</strong>
                                    <span style="color: #48bb78; font-weight: 700;">${inscripcionData.estado || 'CONFIRMADO'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Información del Evento -->
                        <div style="background: #fffaf0; border: 2px solid #f6ad55; border-radius: 12px; padding: 20px; margin: 30px 0;">
                            <h3 style="color: #c05621; margin: 0 0 15px 0; text-align: center;">
                                📅 INFORMACIÓN DEL EVENTO
                            </h3>
                            <div style="text-align: center; color: #744210; line-height: 1.6;">
                                <strong style="font-size: 18px;">28, 29, 30 y 31 de Agosto 2025</strong><br>
                                <strong>📍 Dunas de Nazca - Rumbo a Cerro Marcha</strong><br>
                                🏢 Organizado por la Comunidad 4X4
                            </div>
                        </div>
                        
                        <!-- Próximos Pasos -->
                        <div style="background: #f0fff4; border: 2px solid #48bb78; border-radius: 12px; padding: 20px; margin: 30px 0;">
                            <h3 style="color: #22543d; margin: 0 0 15px 0; text-align: center;">
                                📋 PRÓXIMOS PASOS
                            </h3>
                            <ul style="color: #2f855a; margin: 0; padding-left: 20px; line-height: 1.8;">
                                <li><strong>Prepare su vehículo</strong> según los requisitos técnicos</li>
                                <li><strong>Mantenga actualizada su información</strong> de contacto</li>
                                <li><strong>Esté atento a comunicaciones</strong> sobre briefings y detalles</li>
                                <li><strong>Confirme su llegada</strong> el ${inscripcionData.diaLlegada} como indicó</li>
                                <li><strong>Guarde este email</strong> para futuras referencias</li>
                            </ul>
                        </div>
                        
                        <!-- Información de Contacto -->
                        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 12px;">
                            <h3 style="color: #4a5568; margin: 0 0 15px 0;">📞 ¿Necesita ayuda?</h3>
                            <p style="color: #718096; margin: 0 0 10px 0;">
                                Si tiene alguna pregunta o necesita modificar su inscripción, contáctenos:
                            </p>
                            <p style="color: #3182ce; margin: 0; font-weight: 600;">
                                📧 info@desafiodunasdenazca.com<br>
                                📱 WhatsApp: +51 987 654 321
                            </p>
                        </div>
                        
                    </div>
                    
                    <!-- Footer -->
                    <div style="background: #2d3748; color: white; padding: 25px; text-align: center;">
                        <div style="margin-bottom: 15px;">
                            <strong style="font-size: 18px;">🏜️ Desafío Dunas de Nazca 2025</strong>
                        </div>
                        <p style="margin: 0; font-size: 14px; color: #a0aec0;">
                            Una aventura épica en el corazón del desierto peruano<br>
                            Con el apoyo de la Municipalidad del Valle de Trancas - Vista Alegre - Nasca
                        </p>
                        
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #4a5568;">
                            <p style="margin: 0; font-size: 12px; color: #a0aec0;">
                                Este es un email automático. Por favor, no responda a esta dirección.<br>
                                Si no puede ver este email correctamente, 
                                <a href="#" style="color: #63b3ed;">haga clic aquí</a>.
                            </p>
                        </div>
                    </div>
                    
                </div>
            `;
            
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
                to: email,
                subject: `🎉 ¡Inscripción Confirmada! - Desafío Dunas de Nazca 2025 - #${numeroInscripcion}`,
                html: htmlTemplate,
                text: `
¡INSCRIPCIÓN CONFIRMADA!

Felicitaciones ${nombreCompleto},

Su inscripción al Desafío Dunas de Nazca 2025 ha sido confirmada exitosamente.

DATOS DE SU INSCRIPCIÓN:
- Número de Inscripción: ${numeroInscripcion}
- Participante: ${nombreCompleto}
- Tipo: ${inscripcionData.tripulante}
- Grupo: ${inscripcionData.grupo || 'Por asignar'}
- Frecuencia: ${inscripcionData.frecuencia ? inscripcionData.frecuencia + ' MHz' : 'Por asignar'}
- Vehículo: ${inscripcionData.vehiculoCompleto || (inscripcionData.marca + ' ' + inscripcionData.modelo)}
- Llegada: ${inscripcionData.diaLlegada}
- Estado: ${inscripcionData.estado || 'CONFIRMADO'}

EVENTO: 28, 29, 30 y 31 de Agosto 2025
LUGAR: Dunas de Nazca - Rumbo a Cerro Marcha

¡Nos vemos en las dunas!

Desafío Dunas de Nazca 2025
                `
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