# 🎙️ Adobe Podcast Enhancer - Platzi Edition

Aplicación de escritorio para automatizar la subida, procesamiento y descarga de videos en Adobe Podcast Enhancement con diseño de Platzi.

## ✨ Características

- 🎨 **Interfaz Nativa con Tkinter** - No requiere navegador
- 🎨 **Diseño Moderno con Colores de Platzi**
- 🔐 **Login Automático con Adobe**
- 📤 **Subida de Múltiples Videos**
- 🤖 **Procesamiento Automático con Puppeteer**
- 💾 **Descarga Automática**
- 📊 **Log en Tiempo Real**
- 🔒 **Almacenamiento Seguro de Credenciales**

## 🚀 Instalación Rápida

### 1. Requisitos

- **Python 3.8+** - [Descargar](https://www.python.org/downloads/)
- **Node.js 18+** - [Descargar](https://nodejs.org/)

### 2. Instalar Dependencias Node.js

```bash
cd D:\CURSOR\AdobePodcast
npm install
```

### 3. Crear Acceso Directo en Escritorio

Ejecuta:
```bash
Crear_Acceso_Directo_Escritorio.bat
```

¡Listo! Ahora tienes un acceso directo en tu escritorio.

## 📖 Uso

### Opción 1: Desde el Escritorio

1. Haz doble clic en **"Adobe Podcast Enhancer"** en tu escritorio
2. La aplicación se abrirá automáticamente

### Opción 2: Desde la Carpeta

1. Haz doble clic en `AdobePodcast.bat`

### Flujo de Trabajo

1. **Iniciar Sesión**
   - Ingresa tu email y contraseña de Adobe
   - Marca "Recordar credenciales" (opcional)
   - Click en "Iniciar Sesión"

2. **Configurar**
   - Configura la ruta de descarga
   - Ajusta opciones de descarga
   - Guarda configuración

3. **Seleccionar Videos**
   - Click en "Seleccionar Videos"
   - Elige uno o varios archivos (MP4, MOV, AVI, MKV, WEBM, M4V)

4. **Procesar**
   - Click en "Procesar Videos"
   - Observa el progreso en tiempo real
   - Los archivos se descargan automáticamente

## 🎨 Diseño Platzi

La aplicación usa la paleta oficial de Platzi:

- **Verde Platzi**: `#98CA3F`
- **Verde Hover**: `#B8E65F`
- **Azul Oscuro**: `#0C1526`
- **Azul Oscuro 2**: `#121F3D`
- **Azul Medio**: `#24385B`

## 📂 Estructura

```
D:\CURSOR\AdobePodcast\
├── adobe_podcast_gui.py           # Aplicación principal GUI
├── automation.js                  # Script Puppeteer
├── AdobePodcast.bat              # Launcher
├── Crear_Acceso_Directo_Escritorio.bat
├── package.json                   # Dependencias Node.js
├── requirements.txt               # Dependencias Python (ninguna)
├── README.md
├── config/                        # Configuración (auto-creado)
│   ├── settings.json
│   └── credentials.json
└── node_modules/                  # Dependencias (auto-creado)
```

## ⚙️ Configuración

### Archivo `config/settings.json`

```json
{
  "download_path": "C:\\Users\\Usuario\\Downloads\\AdobePodcast",
  "auto_download": true,
  "keep_original": true
}
```

### Credenciales

Las credenciales se guardan en `config/credentials.json` encriptadas en base64.

## 🔧 Troubleshooting

### "Python no está instalado"

1. Descarga Python desde [python.org](https://www.python.org/downloads/)
2. Durante la instalación, marca "Add Python to PATH"
3. Reinicia tu computadora

### "Node.js no está instalado"

1. Descarga Node.js desde [nodejs.org](https://nodejs.org/)
2. Instala la versión LTS
3. Reinicia tu computadora

### Error al crear acceso directo

Ejecuta `Crear_Acceso_Directo_Escritorio.bat` como Administrador:
- Click derecho → "Ejecutar como administrador"

### La ventana se cierra inmediatamente

Abre una terminal y ejecuta:
```bash
cd D:\CURSOR\AdobePodcast
python adobe_podcast_gui.py
```

Esto te mostrará el error.

## 🔒 Seguridad

- Credenciales almacenadas localmente (encriptadas en base64)
- NO se comparten con terceros
- Solo comunicación con Adobe Podcast
- Archivos temporales limpiados automáticamente

## 📝 Notas Técnicas

- **GUI**: Tkinter (incluido en Python, sin dependencias extra)
- **Automatización**: Puppeteer (Node.js)
- **Modo Headless**: Configurable en `automation.js`
- **Timeouts**: Ajustables en `automation.js`

## 🎯 Formatos Soportados

✅ MP4, MOV, AVI, MKV, WEBM, M4V

## 📄 Licencia

MIT License - Uso libre

## 🎓 Créditos

- **Diseño**: Basado en [Platzi](https://platzi.com)
- **Automatización**: Puppeteer
- **GUI**: Tkinter
- **Servicio**: [Adobe Podcast](https://podcast.adobe.com)

---

**¡Disfruta mejorando tus videos con Adobe Podcast! 🎙️✨**
