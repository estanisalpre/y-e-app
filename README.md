# 💕 Love Notes PWA - Mensajes de Amor Diarios

> Una PWA especial que envía mensajes de amor automáticamente cada mañana a las 7 AM

## ✨ Características

- 📱 **PWA Completa**: Se instala como app nativa
- 🔔 **Push Notifications**: Mensajes automáticos sin abrir la app
- 💖 **Diseño Hermoso**: Interfaz rosa y romántica con Tailwind CSS
- ⚡ **Cero Costos**: Desplegado gratis en Netlify
- 🔄 **Automático**: Cron job diario para envío de mensajes
- 📴 **Funciona Offline**: Service Worker para disponibilidad

## 🛠 Stack Tecnológico

- **Frontend**: Astro + TypeScript + Tailwind CSS 4
- **Backend**: Netlify Functions (Node.js)
- **Push Service**: Web Push Protocol con claves VAPID
- **Deployment**: Netlify (Frontend + Functions + Cron)
- **PWA**: Service Worker + Manifest.json

## 🚀 Instalación Rápida

```bash
# 1. Clonar e instalar
git clone https://github.com/tu-usuario/love-notifications-pwa.git
cd love-notifications-pwa
npm install

# 2. Generar claves VAPID
npm run generate-vapid

# 3. Actualizar clave pública en src/scripts/notification-manager.ts
# 4. Agregar iconos en public/ (icon-192.png, icon-512.png, favicon.ico)

# 5. Desarrollo local
npm run dev

# 6. Build y deploy
npm run build
git add . && git commit -m "🚀 Deploy love PWA"
git push origin main
```

## 📁 Estructura del Proyecto

```
love-notifications-pwa/
├── src/
│   ├── components/          # Componentes Astro
│   ├── layouts/            # Layout principal
│   ├── pages/              # Página principal
│   └── scripts/            # TypeScript para PWA
├── public/
│   ├── sw.js              # Service Worker
│   ├── manifest.json      # PWA Manifest
│   └── *.png              # Iconos PWA
├── netlify/
│   └── functions/         # API Functions
├── data/
│   └── messages.json      # Mensajes de amor
└── *.config.*            # Configuración
```

## 🔧 Configuración

### Variables de Entorno (Netlify)
```env
VAPID_PUBLIC_KEY=BKxvz-zi9LI...
VAPID_PRIVATE_KEY=AAEC_O2-ui9r...
VAPID_EMAIL=tu-email@gmail.com
```

### Endpoints API
- `GET /.netlify/functions/get-messages` - Obtener mensajes
- `POST /.netlify/functions/register-user` - Registrar usuario  
- `POST /.netlify/functions/send-notification` - Enviar notificación

## 📱 Flujo de Usuario

1. **Primera vez**: 
   - Abre la PWA
   - Acepta notificaciones
   - Instala la app ("Añadir a inicio")

2. **Diario**:
   - 7 AM: Recibe push notification automática
   - Toca la notificación para ver mensaje completo
   - No necesita abrir la app manualmente

## 🎨 Personalización

### Cambiar Mensajes
Edita `data/messages.json` o las funciones en `netlify/functions/`

### Cambiar Horario  
Modifica `netlify.toml`:
```toml
schedule = "0 8 * * *"  # 8 AM en lugar de 7 AM
```

### Cambiar Colores
Personaliza `tailwind.config.mjs`:
```js
colors: {
  love: {
    500: '#tu-color-favorito'  
  }
}
```

## 📊 API Reference

### Get Today's Message
```javascript
GET /.netlify/functions/get-messages
Response: {
  "message": {
    "id": 1,
    "title": "Buenos días mi amor ☀️",
    "message": "Tu mensaje...",
    "emoji": "☀️"
  },
  "date": "2024-01-01"
}
```

### Register User for Notifications
```javascript
POST /.netlify/functions/register-user
Body: {
  "subscription": { /* Push subscription object */ },
  "userAgent": "Chrome/...",
  "timestamp": "2024-01-01T07:00:00Z"
}
```

## 🔍 Debugging

### Logs importantes
- Netlify Functions logs: Dashboard → Functions
- Service Worker: DevTools → Application → Service Workers  
- Push notifications: DevTools → Application → Storage

### Problemas comunes
- **Notificaciones no llegan**: Verificar claves VAPID
- **PWA no instala**: Verificar manifest.json y HTTPS
- **Functions fallan**: Verificar environment variables

## 🌐 Deploy en Netlify

1. **Fork/Clone** este repo
2. **Conectar** repo en Netlify  
3. **Build settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Variables**: Agregar claves VAPID
5. **Deploy**: Automático en cada push

## 💝 Para tu Novia

### Android
1. Abre el link en Chrome
2. Toca "💕 Activar Notificaciones" 
3. Permite notificaciones
4. Menú → "Instalar aplicación"

### iOS  
1. Abre el link en Safari
2. Toca "💕 Activar Notificaciones"
3. Permite notificaciones  
4. Compartir → "Añadir a la pantalla de inicio"

## 🔒 Privacidad y Seguridad

- No se almacenan datos personales
- Solo se guarda la subscription para push notifications
- Funciona con HTTPS (requerido para PWA)
- No tracking ni analytics por defecto

## 📄 Licencia

MIT - Úsalo libremente para expresar tu amor 💕

## 💌 Mensajes Incluidos

La app incluye 15+ mensajes únicos de amor que rotan diariamente, más mensajes especiales para:
- Lunes motivacionales 💪
- Viernes de celebración 🎉  
- Fines de semana románticos 🥳

---

**¡Hecho con 💖 para sorprender a tu persona especial!**

### 🤝 Contribuir

¿Ideas para mejorar? Pull requests bienvenidos:
- Más mensajes románticos
- Mejores animaciones
- Nuevas características PWA

### ⭐ ¿Te gustó?

Si este proyecto te ayudó a sorprender a tu pareja, ¡dale una estrella! ⭐