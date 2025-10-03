# 🌐 Usar Chrome Personal con Adobe Podcast Enhancer

## ✅ Beneficios de Usar Chrome Instalado

- **Sin verificación de código** - Usa tu sesión de Chrome existente
- **Sesión persistente** - No necesitas loguearte cada vez
- **Sin CAPTCHAs** - Chrome reconoce tu perfil normal
- **Cookies guardadas** - Mantiene tus preferencias

---

## 🎯 Configuración Actual

La aplicación ahora usa automáticamente:

1. **Tu Chrome instalado** (no Chromium de Puppeteer)
2. **Perfil persistente** en `%LOCALAPPDATA%\AdobePodcastEnhancer\ChromeProfile`
3. **Anti-detección** - Oculta que es automatización

---

## 📝 Primera Vez - Login Manual

La primera vez que uses la app:

1. Se abrirá Chrome
2. **Completa manualmente** el login de Adobe:
   - Ingresa email
   - Ingresa contraseña
   - Si aparece verificación 2FA, complétala
   - Marca "Recordar este dispositivo" (si aparece)

3. La app continuará automáticamente después del login

---

## 🔄 Usos Posteriores

Después del primer login:

- ✅ Chrome recordará tu sesión
- ✅ No pedirá verificación de código
- ✅ Login automático (si la sesión está activa)

---

## 🗑️ Limpiar Sesión

Si necesitas limpiar la sesión guardada:

**Windows:**
```
%LOCALAPPDATA%\AdobePodcastEnhancer\ChromeProfile
```

Elimina esa carpeta y se creará una nueva sesión.

---

## ⚙️ Ubicaciones de Chrome

La app busca Chrome en:

1. `C:\Program Files\Google\Chrome\Application\chrome.exe`
2. `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
3. `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe`

Si no lo encuentra, usa Chromium de Puppeteer.

---

## 💡 Consejos

- **Primera vez**: Estate atento para completar 2FA manualmente
- **Verificación de código**: Complétala una vez y marca "Confiar en este dispositivo"
- **Sesión expirada**: Si expira, simplemente vuelve a loguearte manualmente

---

## 🔒 Seguridad

- El perfil de Chrome se guarda localmente
- No se comparte con tu Chrome normal (usa perfil separado)
- Las cookies y sesiones se mantienen privadas

---

**¡Ahora el login será mucho más fácil! 🎉**

