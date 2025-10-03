# 📋 Resumen del Proyecto

## Adobe Podcast Enhancer - Platzi Edition

### 🎯 Descripción
Aplicación de escritorio con GUI nativa (Tkinter) que automatiza la subida, procesamiento y descarga de videos en Adobe Podcast Enhancement, con diseño moderno usando los colores oficiales de Platzi.

---

## 📦 Archivos Principales

### 🖥️ Aplicación
- **`adobe_podcast_gui.py`** - Interfaz gráfica principal con Tkinter
- **`automation.js`** - Script de automatización con Puppeteer (Node.js)

### 🚀 Launchers
- **`AdobePodcast.bat`** - Ejecutable principal de la aplicación
- **`Crear_Acceso_Directo_Escritorio.bat`** - Crea acceso directo en el escritorio

### 📖 Documentación
- **`README.md`** - Documentación completa
- **`INICIO_RAPIDO.txt`** - Guía de inicio rápido
- **`GUIA_RAPIDA.md`** - Guía rápida en Markdown
- **`CHANGELOG.md`** - Historial de cambios

### ⚙️ Configuración
- **`package.json`** - Dependencias de Node.js
- **`requirements.txt`** - Dependencias de Python (ninguna necesaria)
- **`config/`** - Directorio de configuración (auto-creado)
  - `settings.json` - Configuración de la app
  - `credentials.json` - Credenciales encriptadas

---

## 🎨 Características de Diseño

### Paleta de Colores Platzi
```
Verde Platzi:       #98CA3F
Verde Hover:        #B8E65F
Azul Oscuro:        #0C1526
Azul Oscuro 2:      #121F3D
Azul Medio:         #24385B
Azul Claro:         #2E4A6D
Blanco:             #FFFFFF
Gris:               #A6B6CC
```

### Elementos de Diseño
- ✅ Cards modernos con borde verde Platzi
- ✅ Botones con efectos hover
- ✅ Diseño flat (sin bordes innecesarios)
- ✅ Fuente: Segoe UI
- ✅ Interfaz responsive
- ✅ Log en tiempo real con fuente monospace

---

## 🔧 Tecnologías Utilizadas

### Backend
- **Python 3.8+** - Lenguaje principal
- **Tkinter** - GUI nativa (incluida en Python)
- **Node.js 18+** - Runtime para Puppeteer

### Automatización
- **Puppeteer** - Control del navegador
- **Yargs** - Parsing de argumentos

### Almacenamiento
- **JSON** - Configuración y credenciales
- **Base64** - Encriptación básica de credenciales

---

## 📁 Estructura de Carpetas

```
D:\CURSOR\AdobePodcast\
│
├── 🖥️ Aplicación Principal
│   ├── adobe_podcast_gui.py       # GUI con Tkinter
│   └── automation.js               # Automatización Puppeteer
│
├── 🚀 Ejecutables
│   ├── AdobePodcast.bat
│   └── Crear_Acceso_Directo_Escritorio.bat
│
├── 📖 Documentación
│   ├── README.md
│   ├── INICIO_RAPIDO.txt
│   ├── GUIA_RAPIDA.md
│   ├── CHANGELOG.md
│   └── LICENSE
│
├── ⚙️ Configuración
│   ├── package.json
│   ├── requirements.txt
│   └── config/
│       ├── settings.json
│       ├── credentials.json
│       └── README.md
│
└── 📦 Dependencias (auto-instaladas)
    └── node_modules/
```

---

## 🎯 Flujo de Uso

1. **Instalación**
   ```bash
   npm install
   ```

2. **Crear Acceso Directo**
   - Ejecutar `Crear_Acceso_Directo_Escritorio.bat`

3. **Abrir App**
   - Doble click en acceso directo del escritorio
   - O ejecutar `AdobePodcast.bat`

4. **Login**
   - Ingresar email y contraseña de Adobe
   - Opcionalmente recordar credenciales

5. **Configurar**
   - Establecer ruta de descarga
   - Configurar opciones

6. **Procesar Videos**
   - Seleccionar videos (MP4, MOV, AVI, MKV, WEBM, M4V)
   - Click en "Procesar Videos"
   - Ver progreso en tiempo real
   - Archivos se descargan automáticamente

---

## 🔒 Seguridad

- ✅ Credenciales almacenadas localmente
- ✅ Encriptación básica (Base64)
- ✅ Sin compartir datos con terceros
- ✅ Solo comunicación con Adobe Podcast
- ✅ Archivos temporales limpiados

---

## 📊 Formatos Soportados

### Videos
- ✅ MP4
- ✅ MOV
- ✅ AVI
- ✅ MKV
- ✅ WEBM
- ✅ M4V

---

## 🚀 Próximas Mejoras

### v1.1.0
- [ ] Historial de procesamiento
- [ ] Estadísticas de uso
- [ ] Notificaciones de escritorio
- [ ] Modo batch avanzado

### v1.2.0
- [ ] Integración con almacenamiento en la nube
- [ ] Procesamiento en paralelo
- [ ] Queue de procesamiento
- [ ] Reintentos automáticos

---

## 📞 Soporte

### Problemas Comunes

**"Python no encontrado"**
- Instalar desde [python.org](https://www.python.org)
- Marcar "Add Python to PATH" durante instalación

**"Node.js no encontrado"**
- Instalar desde [nodejs.org](https://nodejs.org)
- Usar versión LTS

**"Error al crear acceso directo"**
- Ejecutar como Administrador
- Click derecho → "Ejecutar como administrador"

---

## 📄 Licencia

MIT License - Uso libre y sin restricciones

---

## 🎓 Créditos

- **Diseño**: Inspirado en [Platzi](https://platzi.com)
- **Automatización**: Puppeteer
- **GUI**: Tkinter (Python)
- **Servicio**: [Adobe Podcast](https://podcast.adobe.com/enhance)

---

**Creado con ❤️ usando los colores de Platzi 🎨**

v1.0.0 - 2025-10-03

