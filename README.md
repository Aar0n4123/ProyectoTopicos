# API de Manipulación de Imágenes

**Universidad Católica Andrés Bello - Tópicos Especiales de Programación**  
**Profesor:** Italo Visconti

API REST que ofrece manipulación de imágenes como un servicio (Image Manipulation as a Service). Permite a usuarios autenticados subir imágenes y aplicar diversas transformaciones sobre ellas.

## 🎯 Características

- ✅ Autenticación con JWT (JSON Web Tokens)
- ✅ Procesamiento de imágenes con Sharp
- ✅ Programación Orientada a Aspectos (AOP) con Decorators
- ✅ Inyección de Dependencias
- ✅ Programación Genérica
- ✅ Patrones de Diseño (Strategy, Decorator, Factory)
- ✅ Logging a archivo y MongoDB
- ✅ TypeScript con tipado estricto

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Lenguaje | TypeScript |
| Framework API | Express.js |
| Procesamiento de Imágenes | Sharp |
| Base de Datos | MongoDB |
| Autenticación | JWT |
| Hashing | bcryptjs |

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd image-manipulation-api
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus valores:
```env
MONGODB_URI=mongodb://localhost:27017/image_manipulation_db
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h
PORT=3000
MAX_FILE_SIZE=10485760
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

5. **Compilar y ejecutar en producción:**
```bash
npm run build
npm start
```

## 📚 Documentación de la API

### Base URL
```
http://localhost:3000
```

### Autenticación

#### Registrar Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com"
    }
  },
  "timestamp": "2024-12-27T10:30:00.000Z"
}
```

#### Iniciar Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com"
    }
  },
  "timestamp": "2024-12-27T10:30:00.000Z"
}
```

### Manipulación de Imágenes

**Nota:** Todos los endpoints de imágenes requieren el header:
```
Authorization: Bearer <tu_token_jwt>
```

#### 1. Redimensionar Imagen
```http
POST /images/resize
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
width: 800
height: 600
fit: cover (opcional: cover, contain, fill, inside, outside)
```

#### 2. Recortar Imagen
```http
POST /images/crop
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
left: 100
top: 100
width: 500
height: 500
```

#### 3. Convertir Formato
```http
POST /images/format
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
format: webp (jpeg, png, webp)
```

#### 4. Rotar Imagen
```http
POST /images/rotate
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
angle: 90 (90, 180, 270)
```

#### 5. Aplicar Filtro
```http
POST /images/filter
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
filter: grayscale (blur, sharpen, grayscale)
```

#### 6. Pipeline de Operaciones (Bonus)
```http
POST /images/pipeline
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: [archivo]
operations: [
  { "type": "resize", "params": { "width": 800 } },
  { "type": "grayscale" },
  { "type": "format", "params": { "format": "webp" } }
]
```

### Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 400 | Parámetros inválidos o faltantes |
| 401 | Token JWT ausente o inválido |
| 413 | Archivo muy grande (>10MB) |
| 415 | Formato de imagen no soportado |
| 500 | Error interno del servidor |

### Formatos Soportados

**Entrada:** JPEG, JPG, PNG, WebP, AVIF, TIFF  
**Salida:** JPEG, PNG, WebP  
**Tamaño máximo:** 10MB

## 🧪 Ejemplos de Uso

### Con cURL

**Registrar usuario:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Redimensionar imagen:**
```bash
curl -X POST http://localhost:3000/images/resize \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/image.jpg" \
  -F "width=800" \
  -F "height=600" \
  --output resized.jpg
```

**Aplicar filtro:**
```bash
curl -X POST http://localhost:3000/images/filter \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/image.jpg" \
  -F "filter=grayscale" \
  --output grayscale.jpg
```

### Con Postman/Insomnia

1. Crear una colección nueva
2. Agregar variable `baseUrl` = `http://localhost:3000`
3. Agregar variable `token` para guardar el JWT
4. Crear requests según la documentación
5. En endpoints de imagen, usar `multipart/form-data` y agregar:
   - Campo `image` tipo `File`
   - Campos adicionales según endpoint

## 🏗️ Arquitectura

El proyecto implementa los siguientes conceptos:

### Programación Orientada a Aspectos (AOP)
- **AuthDecorator:** Maneja la autenticación JWT
- **LoggingDecorator:** Registra todas las operaciones

### Inyección de Dependencias
- Los servicios se inyectan por constructor
- Uso de interfaces para desacoplamiento

### Patrones de Diseño
- **Strategy:** Diferentes operaciones de imagen
- **Decorator:** Cross-cutting concerns (auth, logging)
- **Factory:** Creación de operaciones

### Estructura del Proyecto
```
src/
├── index.ts                 # Punto de entrada
├── config/
│   └── database.ts          # Configuración MongoDB
├── models/
│   └── User.ts              # Modelo de usuario
├── routes/
│   ├── auth.routes.ts       # Rutas de autenticación
│   └── image.routes.ts      # Rutas de imágenes
├── handlers/
│   └── ImageHandler.ts      # Handlers de procesamiento
├── services/
│   ├── ImageService.ts      # Operaciones con Sharp
│   └── AuthService.ts       # Lógica de autenticación
├── decorators/
│   ├── AuthDecorator.ts     # Aspecto de seguridad
│   └── LoggingDecorator.ts  # Aspecto de logging
├── logging/
│   ├── ILogger.ts           # Interfaz de logging
│   ├── FileLogger.ts        # Implementación archivo
│   ├── MongoLogger.ts       # Implementación MongoDB
│   └── CompositeLogger.ts   # Logger compuesto
├── middleware/
│   └── upload.ts            # Configuración multer
└── types/
    └── index.ts             # Definiciones de tipos
```

## 📝 Logging

El sistema registra todas las operaciones en:
- **Archivo:** `logs/app.log` (formato JSON Lines)
- **MongoDB:** Colección `logs`

**Ejemplo de log:**
```json
{"timestamp":"2024-12-27T10:30:00Z","level":"info","user":"user@example.com","endpoint":"/images/resize","params":{"width":800,"height":600},"duration":234,"result":"success"}
```

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Autenticación JWT con expiración configurable
- Validación de tipos MIME para imágenes
- Límite de tamaño de archivo (10MB)
- TypeScript con tipado estricto (sin `any`)

## 🧑‍💻 Desarrollo

**Ejecutar en modo desarrollo (con hot-reload):**
```bash
npm run dev
```

**Compilar TypeScript:**
```bash
npm run build
```

**Ejecutar compilado:**
```bash
npm start
```

## 📄 Licencia

Este proyecto es parte del curso de Tópicos Especiales de Programación de la Universidad Católica Andrés Bello.

## 👥 Autores

Equipo de 4 estudiantes - UCAB 2024

---

**Nota:** Para dudas o problemas, revisar los logs en `logs/app.log` o contactar al profesor.
