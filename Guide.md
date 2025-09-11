# 🚀 Guía Completa de Despliegue - PWA de Amor

## 📋 Checklist Pre-Despliegue

### 1. Generar Claves VAPID
```bash
# En tu proyecto local, ejecuta:
npm run generate-vapid
```
Esto te dará algo como:
```
{
  "publicKey": "BKxvz-zi9LI...",
  "privateKey": "AAEC_O2-ui9r..."
}
```

### 2. Actualizar Clave VAPID en el Frontend
Edita `src/scripts/notification-manager.ts` línea 8:
```typescript
private vapidPublicKey = 'TU_CLAVE_PUBLICA_AQUI';
```

### 3. Crear Iconos PWA
Necesitas crear dos iconos:
- `public/icon-192.png` (192x192 pixeles)
- `public/icon-512.png` (512x512 pixeles)
- `public/favicon.ico`

Puedes usar herramientas como:
- [Favicon.io](https://favicon.io/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

## 🌐 Despliegue en Netlify

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "🚀 Initial commit: Love PWA"
git remote add origin https://github.com/tu-usuario/love-notifications-pwa.git
git push -u origin main
```

### Paso 2: Conectar con Netlify
1. Ve a [netlify.com](https://netlify.com) y regístrate
2. Click en "New site from Git"
3. Conecta tu GitHub y selecciona el repo `love-notifications-pwa`
4. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

### Paso 3: Variables de Entorno en Netlify
En tu dashboard de Netlify:
1. Ve a Site settings → Environment variables
2. Agrega estas variables:

```env
VAPID_PUBLIC_KEY=tu_clave_publica_vapid
VAPID_PRIVATE_KEY=tu_clave_privada_vapid
VAPID_EMAIL=tu_email@gmail.com
```

### Paso 4: Configurar Cron Job
Para envío automático diario, necesitas configurar un webhook:

1. **Opción A: Netlify Scheduled Functions (Recomendado)**
   - Ya está configurado en `netlify.toml`
   - Se ejecuta automáticamente a las 7 AM

2. **Opción B: Servicio externo gratuito**
   - Usa [cron-job.org](https://cron-job.org) (gratis)
   - URL a llamar: `https://tu-sitio.netlify.app/.netlify/functions/send-notification`
   - Schedule: `0 7 * * *` (7 AM diario)

## ✅ Verificación Post-Despliegue

### 1. Verificar PWA
- [ ] La app se puede instalar (botón "Añadir a inicio")
- [ ] Funciona offline básicamente
- [ ] Manifest.json se carga correctamente

### 2. Verificar Notificaciones
- [ ] Se puede registrar para notificaciones
- [ ] Aparece notificación de prueba
- [ ] Service worker se registra sin errores

### 3. Verificar Functions
- [ ] `/.netlify/functions/register-user` responde 200
- [ ] `/.netlify/functions/get-messages` devuelve mensajes
- [ ] `/.netlify/functions/send-notification` (manual test)

## 🧪 Testing Manual

### Probar Registro de Usuario
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/register-user \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/test",
      "keys": {
        "p256dh": "test",
        "auth": "test"
      }
    },
    "userAgent": "Test",
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

### Probar Obtener Mensajes
```bash
curl https://tu-sitio.netlify.app/.netlify/functions/get-messages
```

### Probar Envío de Notificación
```bash
curl -X POST https://tu-sitio.netlify.app/.netlify/functions/send-notification
```

## 📱 Instrucciones para tu Novia

### En Android (Chrome)
1. Abrir la app en Chrome
2. Tocar "💕 Activar Notificaciones"
3. Permitir notificaciones cuando aparezca el popup
4. Tocar el menú (⋮) → "Instalar aplicación" o "Añadir a la pantalla de inicio"

### En iOS (Safari)
1. Abrir la app en Safari
2. Tocar "💕 Activar Notificaciones"  
3. Permitir notificaciones
4. Tocar el botón compartir → "Añadir a la pantalla de inicio"

## 🛠 Solución de Problemas

### Notificaciones no llegan
- Verificar que las claves VAPID estén configuradas
- Verificar que el usuario haya instalado la PWA
- Check browser developer console for errors

### Service Worker no se registra
- Verificar que `public/sw.js` esté accesible
- HTTPS requerido (Netlify provee esto automáticamente)

### Functions devuelven 500
- Verificar logs en Netlify dashboard
- Verificar variables de entorno

## 🎨 Personalización

### Cambiar Mensajes
Edita los mensajes en:
- `netlify/functions/get-messages.ts`
- `netlify/functions/send-notification.ts`

### Cambiar Horario
Edita `netlify.toml` línea con el cron:
```toml
schedule = "0 8 * * *"  # 8 AM instead of 7 AM
```

### Cambiar Colores
Edita `tailwind.config.mjs` para cambiar la paleta de colores.

## 💝 ¡Listo para el Amor!

Una vez todo esté configurado:
1. Tu novia instala la PWA
2. Acepta notificaciones
3. Cada mañana a las 7 AM recibe tu mensaje de amor
4. ¡Sin costo y completamente automático!

## 📊 Monitoreo

Puedes ver estadísticas en:
- Netlify dashboard para function logs
- Analytics de la PWA
- User registrations en los logs

---

**¿Problemas?** Revisa los logs en:
- Netlify Functions logs
- Browser DevTools console
- Network tab para errores de API