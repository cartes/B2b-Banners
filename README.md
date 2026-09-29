# B2B Banners - Sistema de Visualización de Espacios Publicitarios

Aplicación web para visualizar la disponibilidad y distribución de espacios publicitarios (banners y newsletters) en los portales de B2B Media Group.

---

## 🏗️ Arquitectura del Proyecto

El repositorio consta de dos partes:
- **`backend/`**: Servidor API en Node.js (Fastify) que actúa como proxy y transformador de servicios SOAP a JSON, con soporte de modo live y mock offline.
- **`frontend/`**: Aplicación Single Page Application (SPA) construida con Vue 3 y Vite, con previsualización interactiva de banners por portal y formato.

---

## 🚀 Puesta en marcha local

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Ajusta las variables en .env si es necesario
npm run dev
```

El backend se iniciará en `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## 📦 Build y Despliegue en Servidor (VPN)

### Frontend (Build Estático)

El frontend genera archivos HTML, CSS y JS optimizados:

1. Configurar la URL del backend antes de compilar:
   - Si se usa un proxy inverso (ej. Nginx) que redirige `/api` al backend, en `frontend/.env.local` se puede dejar vacío o relativo (`/`).
   - Si se accede directamente a la IP/puerto del backend:
     ```bash
     VITE_API_BASE=http://<IP_SERVIDOR_VPN>:3000
     ```
2. Ejecutar la compilación:
   ```bash
   cd frontend
   npm run build
   ```
3. La carpeta resultante `frontend/dist/` contiene los archivos listos para desplegar en tu servidor web (Nginx, Apache, etc.).

### Backend

El backend no requiere paso de compilación (es JavaScript puro ES Modules):

1. Subir la carpeta `backend/` excluyendo `node_modules`.
2. En el servidor, instalar dependencias de producción:
   ```bash
   cd backend
   npm ci --omit=dev
   ```
3. Configurar el archivo `.env` en el servidor con los valores de producción y la URL del servicio SOAP en la VPN.
4. Ejecutar con un gestor de procesos (como PM2):
   ```bash
   pm2 start server.js --name "b2b-backend"
   pm2 save
   ```
