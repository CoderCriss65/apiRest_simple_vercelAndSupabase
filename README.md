API REST de Empleados con Express.js, Supabase y Vercel
Esta documentación te guiará paso a paso para configurar, ejecutar y desplegar una API REST completa para gestionar empleados utilizando Express.js, Supabase como base de datos, y Vercel para el despliegue.

📁 Estructura del Proyecto
text
api-empleados/
├── index.js             # Archivo principal de la API
├── package.json         # Configuración de dependencias y scripts
├── vercel.json          # Configuración para despliegue en Vercel
├── .env                 # Variables de entorno (local)
└── .gitignore           # Archivos a ignorar por Git
📋 Archivos del Proyecto
1. index.js
javascript
require('dotenv').config({ path: '.env' });
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Configuración y verificación de variables de entorno
console.log('=== ENV VARIABLES ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || 'UNDEFINED!');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? '*** Exists ***' : 'MISSING!');
console.log('PORT:', process.env.PORT || 80);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: Faltan credenciales de Supabase!');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 88;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cors());

// Middleware para loggear solicitudes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// [Aquí van todos los endpoints CRUD para empleados]
// ... (los mismos que proporcionaste en tu código)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Servidor activo en http://localhost:${PORT}`);
});
2. package.json
json
{
  "name": "nodeapirest_vercel_supabase",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.50.2",
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0"
  }
}
3. vercel.json
json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
4. .env (ejemplo)
env
SUPABASE_URL=https://tudeproyecto.supabase.co
SUPABASE_KEY=eyJhbGci01JIUzI1NiTsInR5cCIGIkpXVCJ9...
PORT=88
5. .gitignore
text
# Archivos ignorados
node_modules/
.env
.DS_Store
.vercel
🚀 Guía Paso a Paso
Paso 1: Configurar Supabase
Crear cuenta en Supabase

Crear nuevo proyecto

Crear tabla empleados:

sql
CREATE TABLE empleados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  puesto VARCHAR(100) NOT NULL,
  salario NUMERIC(10,2) NOT NULL
);
Obtener credenciales:

Ve a Project Settings > API

Copia:

URL (SUPABASE_URL)

API Key pública (anon) (SUPABASE_KEY)

Paso 2: Configurar Proyecto Local
Crear carpeta del proyecto:

bash
mkdir api-empleados
cd api-empleados
Inicializar proyecto Node.js:

bash
npm init -y
Instalar dependencias:

bash
npm install express @supabase/supabase-js cors dotenv
Crear archivos:

bash
touch index.js .env .gitignore vercel.json
Configurar .env:

env
SUPABASE_URL=tu_url_supabase
SUPABASE_KEY=tu_clave_anon
PORT=88
Paso 3: Ejecutar Localmente
Iniciar servidor:

bash
npm start
Probar endpoints:

bash
# Obtener todos los empleados
curl http://localhost:88/empleados

# Crear nuevo empleado
curl -X POST http://localhost:88/empleados \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana", "puesto":"Desarrollador", "salario":3000}'
Paso 4: Configurar GitHub
Inicializar repositorio:

bash
git init
Configurar .gitignore:

text
node_modules/
.env
.DS_Store
Agregar archivos y hacer commit:

bash
git add .
git commit -m "Initial commit"
Crear repositorio en GitHub:

Ve a github.com > New repository

Sigue las instrucciones para subir tu código:

bash
git remote add origin https://github.com/tuusuario/turepo.git
git branch -M main
git push -u origin main
Paso 5: Desplegar en Vercel
Crear cuenta en Vercel

Importar proyecto desde GitHub:

Conecta tu cuenta de GitHub

Selecciona el repositorio creado

Configurar variables de entorno:

En Vercel Dashboard > Project Settings > Environment Variables

Agrega:

SUPABASE_URL con tu URL de Supabase

SUPABASE_KEY con tu API Key pública (anon)

Hacer deploy:

Vercel detectará automáticamente la configuración

El despliegue comenzará automáticamente

Probar API en producción:

bash
curl https://tu-api.vercel.app/empleados
🔍 Endpoints de la API
Método	Endpoint	Descripción
GET	/test	Verifica conexión con Supabase
GET	/empleados	Obtiene todos los empleados
GET	/empleados/:id	Obtiene un empleado por ID
POST	/empleados	Crea un nuevo empleado
PUT	/empleados/:id	Actualiza un empleado existente
DELETE	/empleados/:id	Elimina un empleado
💻 Ejemplos de Uso
Crear empleado
bash
curl -X POST https://tu-api.vercel.app/empleados \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos",
    "puesto": "Diseñador",
    "salario": 2800
  }'
Actualizar empleado
bash
curl -X PUT https://tu-api.vercel.app/empleados/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Rodriguez",
    "puesto": "Diseñador Senior",
    "salario": 3200
  }'
🛠️ Solución de Problemas Comunes
Error 500 al conectar con Supabase
Verifica que SUPABASE_URL y SUPABASE_KEY sean correctos

Asegúrate que la tabla empleados existe en Supabase

Desactiva Row Level Security temporalmente en Supabase

Variables de entorno no cargan en Vercel
Verifica que las variables estén en Settings > Environment Variables

Asegúrate que los nombres sean exactos (SUPABASE_URL, SUPABASE_KEY)

Realiza un nuevo deploy después de cambiar las variables

La API no responde después del deploy
Verifica los logs en Vercel Dashboard

Asegúrate que vercel.json está correctamente configurado

Prueba el endpoint /test para verificar conexión con Supabase

🔒 Seguridad
Nunca expongas la clave service_role - usa solo la clave pública (anon)

Configura Row Level Security en Supabase para producción

Usa HTTPS - Vercel proporciona SSL automáticamente

🌐 Recursos Útiles
Documentación de Supabase

Documentación de Vercel

Guía de Express.js
