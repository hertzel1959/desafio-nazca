# 🏁 Desafío Dunas de Nazca 2025

<div align="center">

![Desafío Dunas de Nazca](public/images/logo.png)

**La aventura off-road más emocionante del Perú**

[![Versión](https://img.shields.io/badge/versión-1.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)
[![Licencia](https://img.shields.io/badge/licencia-MIT-blue.svg)](LICENSE)

[🌐 Sitio Web](#) | [📖 Documentación](#documentación) | [🐛 Reportar Bug](#) | [💡 Solicitar Feature](#)

</div>

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#sobre-el-proyecto)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API](#api)
- [Despliegue](#despliegue)
- [Contribuir](#contribuir)
- [Licencia](#licencia)
- [Contacto](#contacto)

## 🎯 Sobre el Proyecto

El **Desafío Dunas de Nazca** es un evento de integración off-road que reúne a los mejores pilotos y equipos del país en una aventura única por las dunas más espectaculares del mundo. Este proyecto es el sitio web oficial del evento que permite a los participantes registrarse, gestionar su información y seguir el evento.

### 🏆 Evento 2025
- **📅 Fechas:** 29, 30 y 31 de Agosto 2025
- **📍 Ubicación:** Duna Grande (Cerro Blanco), Nazca - Ica, Perú
- **🏁 Categorías:** UTVs, ATVs, Motos, Buggies, 4x4, Camiones
- **👥 Organizadores:** Consorcio Off Road Perú
- **🤝 Apoyo:** Municipalidad Provincial de Nasca

## ✨ Características

### 🌟 Para Participantes
- ✅ **Registro Online** - Sistema completo de inscripciones
- 👥 **Gestión de Equipos** - Administra miembros y vehículos
- 📄 **Subida de Documentos** - Carga y verificación de documentación
- 💳 **Pagos en Línea** - Procesamiento seguro de pagos
- 📱 **Responsive Design** - Optimizado para móviles y tablets
- 🔐 **Portal Privado** - Acceso seguro a información del equipo

### 🛠️ Para Administradores
- 📊 **Dashboard Completo** - Estadísticas en tiempo real
- ✅ **Verificación de Registros** - Aprobación y validación
- 📧 **Notificaciones** - Email y SMS automáticos
- 📈 **Reportes** - Exportación de datos y análisis
- 👤 **Gestión de Usuarios** - Control de accesos y permisos
- 🔒 **Seguridad Avanzada** - Protección y auditoría

### 🎨 Experiencia Visual
- 🏜️ **Tema del Desierto** - Diseño inspirado en las dunas
- ⚡ **Animaciones Fluidas** - Efectos visuales envolventes
- 🚗 **Convoy Animado** - Simulación de vehículos off-road
- 🌪️ **Partículas de Arena** - Efectos atmosféricos
- 📱 **PWA Ready** - Installable como app móvil

## 🔧 Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript ES6+** - Funcionalidades interactivas
- **Intersection Observer API** - Animaciones al scroll
- **Web Animations API** - Efectos avanzados

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **bcryptjs** - Hashing de contraseñas
- **JWT** - Autenticación con tokens

### Herramientas y Librerías
- **Morgan** - Logging de requests
- **Helmet** - Seguridad HTTP
- **CORS** - Configuración de CORS
- **Express Rate Limit** - Limitación de requests
- **Compression** - Compresión gzip
- **Multer** - Upload de archivos
- **Nodemailer** - Envío de emails

## 🚀 Instalación

### Prerrequisitos
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **MongoDB** >= 6.0 (local o Atlas)
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/consorcio-offroad-peru/desafio-dunas-nazca.git
cd desafio-dunas-nazca
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Iniciar MongoDB**
```bash
# Si usas MongoDB local
mongod

# Si usas Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

5. **Iniciar la aplicación**
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## ⚙️ Configuración

### Variables de Entorno Esenciales

```bash
# Base de datos
MONGODB_URI=mongodb://localhost:27017/desafio-dunas-nazca

# Seguridad
JWT_SECRET=tu_jwt_secret_muy_seguro
DEFAULT_ADMIN_EMAIL=admin@desafiodunasnazca.com
DEFAULT_ADMIN_PASSWORD=admin123456

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
```

### Configuración de MongoDB Atlas

1. Crear cluster en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Obtener string de conexión
3. Configurar en `.env`:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/desafio-dunas-nazca
```

### Configuración de Email

Para notificaciones automáticas:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=contraseña_de_aplicacion
```

## 📖 Uso

### Para Participantes

1. **Registro**
   - Ir a la sección "Inscripciones"
   - Completar formulario con datos del equipo
   - Crear contraseña para acceso posterior

2. **Gestión de Perfil**
   - Iniciar sesión con email y contraseña
   - Completar información del vehículo
   - Agregar miembros adicionales del equipo

3. **Documentación**
   - Subir documentos requeridos (SOAT, licencias, etc.)
   - Verificar estado de aprobación
   - Recibir notificaciones de cambios

4. **Seguimiento**
   - Ver progreso de inscripción
   - Recibir actualizaciones del evento
   - Acceder a información exclusiva

### Para Administradores

1. **Acceso al Panel**
   ```
   POST /api/admin/login
   ```

2. **Gestión de Registros**
   - Ver lista de inscripciones
   - Aprobar/rechazar registros
   - Verificar documentación

3. **Estadísticas**
   - Dashboard con métricas del evento
   - Exportar datos para reportes
   - Análisis de participación

## 🔌 API

### Endpoints Principales

#### Registro de Participantes
```bash
# Registrar nuevo participante
POST /api/registration/register
Content-Type: application/json

{
  "email": "piloto@example.com",
  "password": "password123",
  "phone": "+51987654321",
  "group": "Los Aventureros",
  "leader": "Juan Pérez"
}
```

#### Autenticación
```bash
# Iniciar sesión
POST /api/registration/login
Content-Type: application/json

{
  "email": "piloto@example.com",
  "password": "password123"
}
```

#### Perfil
```bash
# Obtener perfil
GET /api/registration/profile/:id

# Actualizar perfil
PUT /api/registration/profile/:id
Content-Type: application/json

{
  "vehicle": {
    "brand": "Toyota",
    "model": "Land Cruiser",
    "year": 2020,
    "category": "4x4"
  }
}
```

#### Estadísticas Públicas
```bash
# Obtener estadísticas del evento
GET /api/registration/stats

Response:
{
  "success": true,
  "data": {
    "totalRegistrations": 150,
    "approvedRegistrations": 120,
    "totalParticipants": 380,
    "categoriesCount": {
      "4x4": 45,
      "utv": 35,
      "moto": 40
    }
  }
}
```

### Códigos de Respuesta

- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Error de validación
- `401` - No autorizado
- `403` - Prohibido
- `404` - No encontrado
- `409` - Conflicto (email duplicado)
- `429` - Demasiadas solicitudes
- `500` - Error interno del servidor

## 🌐 Despliegue

### Heroku

1. **Preparar aplicación**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login y crear app
heroku login
heroku create desafio-dunas-nazca
```

2. **Configurar variables de entorno**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=tu_mongodb_atlas_uri
heroku config:set JWT_SECRET=tu_jwt_secret
```

3. **Desplegar**
```bash
git push heroku main
```

### DigitalOcean

1. **Crear Droplet** con Ubuntu 20.04
2. **Instalar dependencias**
```bash
# Conectar via SSH
ssh root@tu_droplet_ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
npm install -g pm2
```

3. **Configurar aplicación**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/desafio-dunas-nazca.git
cd desafio-dunas-nazca

# Instalar dependencias
npm install --production

# Configurar variables de entorno
cp .env.example .env
nano .env

# Iniciar con PM2
pm2 start server/app.js --name "desafio-dunas"
pm2 startup
pm2 save
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Construir y ejecutar
docker build -t desafio-dunas-nazca .
docker run -p 3000:3000 --env-file .env desafio-dunas-nazca
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Linting
npm run lint
npm run lint:fix

# Formateo de código
npm run format
```

## 📁 Estructura del Proyecto

```
desafio-dunas-nazca/
├── 📁 public/                 # Archivos estáticos
│   ├── 📁 css/               # Hojas de estilo
│   ├── 📁 js/                # JavaScript frontend
│   ├── 📁 images/            # Imágenes del sitio
│   └── index.html            # Página principal
├── 📁 server/                # Backend Node.js
│   ├── 📁 models/            # Modelos de MongoDB
│   ├── 📁 routes/            # Rutas de la API
│   ├── 📁 middleware/        # Middleware personalizado
│   ├── 📁 config/            # Configuraciones
│   └── app.js                # Aplicación principal
├── 📁 tests/                 # Tests automatizados
├── 📁 docs/                  # Documentación adicional
├── package.json              # Dependencias y scripts
├── .env.example              # Variables de entorno ejemplo
├── .gitignore               # Archivos ignorados por Git
└── README.md                # Este archivo
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork el proyecto**
2. **Crear branch** (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit cambios** (`git commit -am 'Agregar nueva funcionalidad'`)
4. **Push al branch** (`git push origin feature/nueva-funcionalidad`)
5. **Crear Pull Request**

### Guías de Contribución

- Seguir las convenciones de código existentes
- Escribir tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario
- Usar commits descriptivos siguiendo [Conventional Commits](https://www.conventionalcommits.org/)

### Reportar Bugs

Al reportar bugs, incluir:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del entorno (OS, browser, versión)

## 🔒 Seguridad

### Medidas Implementadas

- **Autenticación JWT** - Tokens seguros con expiración
- **Hashing de Contraseñas** - bcrypt con salt rounds altos
- **Rate Limiting** - Prevención de ataques de fuerza bruta
- **Validación de Datos** - Sanitización de inputs
- **CORS Configurado** - Control de acceso entre dominios
- **Headers de Seguridad** - Helmet.js implementado
- **Sesiones Seguras** - Configuración robusta

### Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, por favor:
1. **NO** crear un issue público
2. Enviar email a: security@desafiodunasnazca.com
3. Incluir descripción detallada y pasos para reproducir
4. Permitir tiempo razonable para el fix antes de disclosure público

## 📊 Monitoreo y Analytics

### Métricas del Sistema
- Tiempo de respuesta de API
- Uso de memoria y CPU
- Errores y excepciones
- Logs de acceso y seguridad

### Analytics del Evento
- Registros por día/semana
- Distribución por categorías de vehículos
- Ubicación geográfica de participantes
- Tasas de conversión del funnel de registro

### Herramientas Recomendadas
- **New Relic** - Monitoreo de aplicación
- **Sentry** - Tracking de errores
- **Google Analytics** - Analytics web
- **PM2 Monitor** - Monitoreo de procesos Node.js

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a MongoDB
```bash
Error: MongoNetworkError: failed to connect to server
```
**Solución:**
- Verificar que MongoDB esté ejecutándose
- Confirmar URI de conexión en `.env`
- Verificar firewall y permisos de red

#### Error de Permisos de Archivos
```bash
Error: EACCES: permission denied
```
**Solución:**
```bash
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ./node_modules
```

#### Puerto en Uso
```bash
Error: listen EADDRINUSE :::3000
```
**Solución:**
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000
# Matar proceso
kill -9 PID
```

### Logs y Debugging

```bash
# Ver logs en desarrollo
npm run dev

# Ver logs de PM2 en producción
pm2 logs desafio-dunas

# Reiniciar aplicación
pm2 restart desafio-dunas

# Ver estado de la aplicación
pm2 status
```

## 📈 Roadmap

### Versión 1.1 (Q3 2025)
- [ ] App móvil nativa (React Native)
- [ ] Tracking GPS en tiempo real durante el evento
- [ ] Sistema de chat entre equipos
- [ ] Galería de fotos con upload de participantes

### Versión 1.2 (Q4 2025)
- [ ] Live streaming integration
- [ ] Sistema de puntuación en tiempo real
- [ ] Marketplace de sponsors
- [ ] API pública para terceros

### Versión 2.0 (2026)
- [ ] Multi-eventos (otros rallies)
- [ ] Sistema de ranking anual
- [ ] Gamificación con badges y logros
- [ ] Integración con redes sociales

## 📚 Documentación Adicional

### Para Desarrolladores
- [API Documentation](docs/api.md)
- [Database Schema](docs/database.md)
- [Frontend Architecture](docs/frontend.md)
- [Deployment Guide](docs/deployment.md)

### Para Administradores
- [Admin Panel Guide](docs/admin-guide.md)
- [User Management](docs/user-management.md)
- [Email Templates](docs/email-templates.md)
- [Backup Procedures](docs/backup.md)

### Para Usuarios
- [Registration Guide](docs/user-guide.md)
- [FAQ](docs/faq.md)
- [Technical Requirements](docs/requirements.md)

## 🌟 Agradecimientos

Este proyecto fue posible gracias a:

- **Consorcio Off Road Perú** - Organización del evento
- **Municipalidad Provincial de Nasca** - Apoyo institucional
- **Comunidad Off-Road Peruana** - Feedback y testing
- **Contributors** - Desarrollo y mejoras

### Tecnologías y Librerías
- [Node.js](https://nodejs.org/) - Runtime de JavaScript
- [Express.js](https://expressjs.com/) - Framework web
- [MongoDB](https://www.mongodb.com/) - Base de datos
- [Mongoose](https://mongoosejs.com/) - ODM para MongoDB

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

```
MIT License

Copyright (c) 2025 Consorcio Off Road Perú

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Contacto

### Equipo de Desarrollo
- **Lead Developer:** [Tu Nombre](mailto:dev@desafiodunasnazca.com)
- **UI/UX Designer:** [Diseñador](mailto:design@desafiodunasnazca.com)

### Organización del Evento
- **Consorcio Off Road Perú**
- **Email:** info@desafiodunasnazca.com
- **Teléfono:** +51 956 123 456
- **WhatsApp:** +51 956 123 456

### Enlaces Oficiales
- 🌐 **Sitio Web:** [desafiodunasnazca.com](https://desafiodunasnazca.com)
- 📘 **Facebook:** [@DesafioDunasNazca](https://facebook.com/DesafioDunasNazca)
- 📷 **Instagram:** [@desafio_dunas_nazca](https://instagram.com/desafio_dunas_nazca)
- 📹 **YouTube:** [Desafío Dunas Nazca](https://youtube.com/c/DesafioDunasNazca)
- 🐦 **Twitter:** [@DesafioDunas](https://twitter.com/DesafioDunas)

---

<div align="center">

**🏁 ¡Nos vemos en las dunas! 🏁**

*Hecho con ❤️ por el equipo de desarrollo del Desafío Dunas de Nazca*

[![Volver arriba](https://img.shields.io/badge/⬆️-Volver%20arriba-blue.svg)](#-desafío-dunas-de-nazca-2025)

</div>
<!-- 

DESAFIO NAZCA  mmolina@icrersil.com GOOGLE
y7PvbObCzvpcqSwM 
cadena de conexión: 
'mongodb+srv://mmolina:y7PvbObCzvpcqSwM@desafio-nazca.08bcyv0.mongodb.net/?retryWrites=true&w=majority&appName=desafio-nazca'


-->