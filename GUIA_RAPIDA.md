# 🚀 Guía Rápida - Adobe Podcast Enhancer

## 📋 Checklist de Instalación

- [ ] Python 3.8+ instalado
- [ ] Node.js 18+ instalado
- [ ] Dependencias Python instaladas: `pip install -r requirements.txt`
- [ ] Dependencias Node.js instaladas: `npm install`

## ⚡ Inicio Rápido

### Windows

```bash
start.bat
```

### Manual

```bash
streamlit run app.py
```

## 🎯 Uso en 5 Pasos

### 1️⃣ Iniciar Sesión
- Abre la aplicación
- Ingresa tu email y contraseña de Adobe
- Click en "Iniciar Sesión"

### 2️⃣ Configurar Ruta
- Sidebar → "Ruta de descarga"
- Ejemplo: `C:\Users\TuNombre\Videos\Procesados`
- Click en "Guardar Configuración"

### 3️⃣ Subir Videos
- Arrastra o selecciona videos
- Formatos: MP4, MOV, AVI, MKV, WEBM, M4V

### 4️⃣ Procesar
- Click en "Procesar Videos"
- Espera (automático)

### 5️⃣ Descargar
- Los archivos se guardan automáticamente en la ruta configurada

## 🎨 Características del Diseño

- **Verde Platzi** (#98CA3F) - Botones y acentos
- **Azul Oscuro** (#0c1526) - Fondo principal
- **Diseño Moderno** - Cards, sombras, animaciones

## ⚙️ Configuración Avanzada

### Cambiar a Modo Headless

Edita `automation.js` línea 52:

```javascript
headless: true  // Cambia false a true
```

### Ajustar Timeouts

En `automation.js`:

```javascript
const LOGIN_TIMEOUT = 60000;        // 1 minuto
const UPLOAD_TIMEOUT = 300000;      // 5 minutos
const PROCESSING_TIMEOUT = 600000;  // 10 minutos
```

## 🔧 Solución de Problemas Rápida

| Problema | Solución |
|----------|----------|
| "Node.js no encontrado" | Instalar desde [nodejs.org](https://nodejs.org) |
| "Python no encontrado" | Instalar desde [python.org](https://python.org) |
| Error de login | Verificar credenciales, desactivar 2FA |
| Video no sube | Verificar formato y tamaño |
| Descarga no inicia | Verificar permisos de carpeta |

## 📊 Formatos Soportados

✅ MP4, MOV, AVI, MKV, WEBM, M4V

## 🔒 Seguridad

- Credenciales guardadas localmente (encriptadas)
- Sin compartir datos con terceros
- Solo comunicación con Adobe Podcast

## 📞 ¿Necesitas Ayuda?

1. Lee el `README.md` completo
2. Revisa los logs en la terminal
3. Verifica que Adobe Podcast esté disponible

---

**¡Listo para mejorar tus videos! 🎙️**

