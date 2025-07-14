# Desafío Dunas de Nazca - Sistema de Inscripciones

Sistema web para la gestión de inscripciones del evento off-road "Desafío Dunas de Nazca".

## 🚀 Instalación y Configuración

### Prerrequisitos

1. **Node.js** (versión 14 o superior)
   ```bash
   # Verificar instalación
   node --version
   npm --version
   ```

2. **MongoDB** (versión 4.4 o superior)
   ```bash
   # En Ubuntu/Debian
   sudo apt-get install mongodb
   
   # En macOS con Homebrew
   brew install mongodb-community
   
   # En Windows, descargar desde mongodb.com
   ```

### Paso 1: Clonar/Crear el Proyecto

```bash
# Crear directorio del proyecto
mkdir desafio-dunas-nazca
cd desafio-dunas-nazca

# Crear estructura de carpetas
mkdir public
```

### Paso 2: Configurar los Archivos

1. **Crear `package.json`** (copiar del artifact `package.json`)
2. **Crear `server.js`** (copiar del artifact `Backend Node.js + MongoDB`)
3. **Crear `.env`** (copiar del artifact `.env`)
4. **Crear `public/index.html`** (copiar del artifact `Desafío Dunas de Nazca`)

### Paso 3: Instalar Dependencias

```bash
npm install
```

### Paso 4: Configurar MongoDB

```bash
# Iniciar MongoDB (depende del sistema)
# En Ubuntu/Debian:
sudo systemctl start mongodb

# En macOS:
brew services start mongodb-community

# En Windows:
# Usar MongoDB Compass o iniciar desde Services
```

### Paso 5: Configurar Variables de Entorno

Editar el archivo `.env` y cambiar:
```bash
JWT_SECRET=tu_clave_secreta_unica_y_segura
MONGODB_URI=mongodb://localhost:27017/desafio_dunas_nazca
```

### Paso 6: Iniciar la Aplicación

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## 📁 Estructura del Proyecto

```
desafio-dunas-nazca/
├── server.js              # Servidor principal
├── package.json           # Dependencias
├── .env                   # Variables de entorno
├── public/
│   └── index.html         # Frontend
└── README.md             # Este archivo
```

## 🌐 Acceso a la Aplicación

Una vez iniciado el servidor:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3000/api

## 📊 Estructura de la Base de Datos

### Colección `teams`

```javascript
{
  "_id": ObjectId,
  "email": "equipo@email.com",
  "password": "hash_encriptado",
  "celular": "+51999888777",
  "nombreGrupo": "Aventureros del Desierto",
  "frecuenciaRadio": "146.520",
  "lider": "Juan Pérez",
  "segundoLider": "María García",
  "miembros": [
    {
      "_id": ObjectId,
      "nombre": "Juan Pérez",
      "dni": "12345678",
      "telefono": "+51999111222",
      "fechaRegistro": ISODate
    }
  ],
  "activated": false,
  "fechaRegistro": ISODate,
  "estado": "pendiente", // "pendiente", "aprobado", "rechazado"
  "documentos": [],
  "vehiculo": {
    "marca": "Toyota",
    "modelo": "Hilux",
    "año": 2020,
    "placa": "ABC-123",
    "color": "Blanco"
  },
  "contactoEmergencia": {
    "nombre": "Ana Pérez",
    "telefono": "+51999333444",
    "relacion": "Esposa"
  }
}
```

## 🔗 Endpoints de la API

### Autenticación
- `POST /api/register` - Registrar nuevo equipo
- `POST /api/login` - Iniciar sesión

### Gestión de Equipos
- `GET /api/team` - Obtener información del equipo actual
- `PUT /api/team` - Actualizar información del equipo
- `POST /api/team/members` - Agregar miembro al equipo
- `DELETE /api/team/members/:memberId` - Eliminar miembro

### Administración
- `GET /api/admin/teams` - Listar todos los equipos
- `PATCH /api/admin/teams/:teamId/activate` - Activar/desactivar equipo

## 🛠️ Comandos Útiles

```bash
# Ver logs en tiempo real
npm run dev

# Verificar estado de MongoDB
mongo --eval "db.stats()"

# Crear usuario administrador de MongoDB (opcional)
mongo
> use desafio_dunas_nazca
> db.createUser({
    user: "admin",
    pwd: "password123",
    roles: ["readWrite"]
  })
```

## 🔧 Solución de Problemas

### Error: MongoDB no se conecta
```bash
# Verificar que MongoDB esté corriendo
sudo systemctl status mongodb

# Reiniciar MongoDB
sudo systemctl restart mongodb
```

### Error: Puerto 3000 ocupado
```bash
# Cambiar puerto en .env
PORT=3001

# O matar proceso en puerto 3000
sudo kill -9 $(lsof -t -i:3000)
```

### Error: Módulos no encontrados
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Despliegue en Producción

### Usando PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "dunas-nazca"

# Ver logs
pm2 logs dunas-nazca

# Reiniciar
pm2 restart dunas-nazca
```

### Variables de Entorno para Producción
```bash
NODE_ENV=production
JWT_SECRET=clave_super_segura_para_produccion
MONGODB_URI=mongodb://usuario:password@localhost:27017/desafio_dunas_nazca
PORT=80
```

## 📞 Soporte

Para problemas técnicos o consultas sobre el sistema, contactar a:
- Email: soporte@desafiodunasdenazca.com
- WhatsApp: +51 999 888 777

---

### 🎯 Próximas Funcionalidades

- [ ] Subida de documentos
- [ ] Sistema de pagos
- [ ] Notificaciones por email
- [ ] Panel de administrador web
- [ ] Reportes en PDF
- [ ] API para aplicación móvil