# 🎙️ Adobe Podcast Enhancer - Platzi Edition

<div align="center">

![Platzi Colors](https://img.shields.io/badge/Diseño-Platzi-98CA3F?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Tkinter](https://img.shields.io/badge/GUI-Tkinter-blue?style=for-the-badge)
![Puppeteer](https://img.shields.io/badge/Automation-Puppeteer-40B5A4?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Aplicación de escritorio para automatizar la mejora de audio en videos usando Adobe Podcast**

[Características](#-características) •
[Instalación](#-instalación) •
[Uso](#-uso) •
[Documentación](#-documentación)

</div>

---

## 📖 Descripción

**Adobe Podcast Enhancer** es una aplicación de escritorio con interfaz gráfica nativa (Tkinter) que automatiza completamente el proceso de subida, procesamiento y descarga de videos en [Adobe Podcast Enhancement](https://podcast.adobe.com/enhance). 

Con un diseño moderno inspirado en los colores oficiales de **Platzi**, esta herramienta te permite mejorar la calidad de audio de múltiples videos de forma automática y profesional.

---

## ✨ Características

### 🎨 Diseño Moderno
- ✅ Interfaz nativa con **Tkinter** (sin navegador)
- ✅ Paleta de colores oficial de **Platzi**
- ✅ Cards modernos con efectos hover
- ✅ Diseño flat y responsive

### 🚀 Funcionalidad
- ✅ **Login automático** con Adobe
- ✅ **Subida múltiple** de videos
- ✅ **Procesamiento automático** con Puppeteer
- ✅ **Descarga automática** de archivos procesados
- ✅ **Log en tiempo real** del progreso
- ✅ **Gestión de configuración** persistente

### 🔒 Seguridad
- ✅ Credenciales almacenadas localmente (encriptadas en Base64)
- ✅ Sin compartir datos con terceros
- ✅ Solo comunicación con Adobe Podcast
- ✅ Limpieza automática de archivos temporales

---

## 🎨 Paleta de Colores Platzi

```css
Verde Platzi:       #98CA3F
Verde Hover:        #B8E65F
Azul Oscuro:        #0C1526
Azul Oscuro 2:      #121F3D
Azul Medio:         #24385B
Azul Claro:         #2E4A6D
Blanco:             #FFFFFF
Gris:               #A6B6CC
```

---

## 🚀 Instalación

### Requisitos Previos

- **Python 3.8+** - [Descargar Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Descargar Node.js](https://nodejs.org/)

### Instalación Paso a Paso

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/Andresporahi/AdobePodcast.git
cd AdobePodcast
```

#### 2. Instalar Dependencias de Node.js

```bash
npm install
```

Esto instalará:
- `puppeteer` - Automatización del navegador
- `yargs` - Procesamiento de argumentos

#### 3. Crear Acceso Directo en Escritorio (Opcional)

**Windows:**
```bash
# Ejecutar el script PowerShell
powershell -ExecutionPolicy Bypass -File Crear_Acceso_Directo.ps1

# O usar el archivo .bat
Crear_Acceso_Directo_Escritorio.bat
```

---

## 📖 Uso

### Opción 1: Desde el Acceso Directo

1. Haz doble clic en **"Adobe Podcast Enhancer"** en tu escritorio

### Opción 2: Desde la Carpeta

```bash
# Windows
AdobePodcast.bat

# Linux/Mac
python3 adobe_podcast_gui.py
```

### Flujo de Trabajo

#### 1️⃣ Iniciar Sesión
- Ingresa tu email y contraseña de Adobe
- Opcionalmente, marca "Recordar credenciales"
- Click en **"Iniciar Sesión"**

#### 2️⃣ Configurar Ruta de Descarga
- Establece la ruta donde se guardarán los archivos procesados
- Por defecto: `C:\Users\TuUsuario\Downloads\AdobePodcast`
- Configura opciones adicionales
- Click en **"Guardar Configuración"**

#### 3️⃣ Seleccionar Videos
- Click en **"Seleccionar Videos"**
- Elige uno o varios archivos
- Formatos soportados: **MP4, MOV, AVI, MKV, WEBM, M4V**

#### 4️⃣ Procesar
- Click en **"Procesar Videos"**
- Observa el progreso en tiempo real en el log
- Los archivos se descargan automáticamente al finalizar

---

## 📂 Estructura del Proyecto

```
AdobePodcast/
├── 📱 adobe_podcast_gui.py           # Aplicación GUI principal
├── 🤖 automation.js                  # Script de automatización Puppeteer
├── 🚀 AdobePodcast.bat               # Launcher Windows
├── 🖱️ Crear_Acceso_Directo.ps1       # Script PowerShell
├── 📦 package.json                   # Dependencias Node.js
├── 📄 requirements.txt               # Dependencias Python
├── 📖 README.md                      # Este archivo
├── 📚 INICIO_RAPIDO.txt              # Guía rápida
├── 📋 RESUMEN_PROYECTO.md            # Resumen técnico
├── 📜 CHANGELOG.md                   # Historial de cambios
├── ⚖️ LICENSE                        # Licencia MIT
├── 🚫 .gitignore                     # Archivos ignorados
└── 📁 config/                        # Configuración (auto-creado)
    ├── settings.json                 # Configuración de la app
    └── credentials.json              # Credenciales encriptadas
```

---

## 🎯 Formatos Soportados

| Formato | Extensión | Soporte |
|---------|-----------|---------|
| MP4     | `.mp4`    | ✅      |
| MOV     | `.mov`    | ✅      |
| AVI     | `.avi`    | ✅      |
| MKV     | `.mkv`    | ✅      |
| WEBM    | `.webm`   | ✅      |
| M4V     | `.m4v`    | ✅      |

---

## ⚙️ Configuración

### Archivo `config/settings.json`

```json
{
  "download_path": "C:\\Users\\Usuario\\Downloads\\AdobePodcast",
  "auto_download": true,
  "keep_original": true
}
```

### Opciones Disponibles

| Opción | Descripción | Por Defecto |
|--------|-------------|-------------|
| `download_path` | Ruta de descarga | `~/Downloads/AdobePodcast` |
| `auto_download` | Descarga automática | `true` |
| `keep_original` | Mantener archivos originales | `true` |

---

## 🔧 Troubleshooting

### "Python no está instalado"

**Solución:**
1. Descarga Python desde [python.org](https://www.python.org/downloads/)
2. Durante la instalación, marca **"Add Python to PATH"**
3. Reinicia tu computadora

### "Node.js no está instalado"

**Solución:**
1. Descarga Node.js desde [nodejs.org](https://nodejs.org/)
2. Instala la versión LTS
3. Reinicia tu computadora

### Error al crear acceso directo

**Solución:**
- Ejecuta como **Administrador**:
  - Click derecho en `Crear_Acceso_Directo.ps1`
  - "Ejecutar con PowerShell"

### La ventana se cierra inmediatamente

**Solución:**
Abre una terminal y ejecuta:
```bash
cd ruta/al/proyecto
python adobe_podcast_gui.py
```
Esto te mostrará el error específico.

### Error de login en Adobe

**Posibles causas:**
- Credenciales incorrectas
- Autenticación de dos factores activa (no soportada)
- CAPTCHA presente
- Problema de conexión a internet

---

## 🛠️ Tecnologías Utilizadas

<div align="center">

| Tecnología | Uso |
|------------|-----|
| **Python 3.8+** | Lenguaje principal |
| **Tkinter** | Interfaz gráfica nativa |
| **Node.js** | Runtime para Puppeteer |
| **Puppeteer** | Automatización del navegador |
| **Yargs** | Parsing de argumentos CLI |
| **JSON** | Almacenamiento de configuración |
| **Base64** | Encriptación básica |

</div>

---

## 📊 Características Técnicas

- **GUI**: Tkinter (incluido en Python, sin dependencias adicionales)
- **Automatización**: Puppeteer con control completo del navegador
- **Modo Headless**: Configurable en `automation.js` (línea 52)
- **Timeouts**: Ajustables para diferentes velocidades de conexión
- **Multithreading**: Procesamiento en thread separado para evitar bloqueos
- **Encriptación**: Base64 para almacenamiento seguro de credenciales

---

## 🚀 Roadmap

### v1.1.0 (Próximamente)
- [ ] Historial de procesamiento con base de datos SQLite
- [ ] Estadísticas de uso y métricas
- [ ] Notificaciones de escritorio al finalizar
- [ ] Modo batch avanzado con cola de procesamiento
- [ ] Previsualización de archivos

### v1.2.0 (Futuro)
- [ ] Integración con almacenamiento en la nube (Google Drive, Dropbox)
- [ ] API REST para integración externa
- [ ] Procesamiento en paralelo de múltiples videos
- [ ] Sistema de plugins y extensiones
- [ ] Soporte para otros servicios de mejora de audio

### v2.0.0 (Planificado)
- [ ] Versión web multiplataforma
- [ ] Modo empresarial con múltiples usuarios
- [ ] Integración con servicios de transcripción
- [ ] Editor de audio integrado

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Adobe Podcast Enhancer - Platzi Edition

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 👨‍💻 Autor

**Proyecto creado con ❤️ usando los colores de Platzi**

---

## 🎓 Créditos

- **Diseño**: Inspirado en [Platzi](https://platzi.com)
- **Automatización**: [Puppeteer](https://pptr.dev/)
- **GUI**: Tkinter (Python Standard Library)
- **Servicio**: [Adobe Podcast](https://podcast.adobe.com/enhance)

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Revisa la sección de [Troubleshooting](#-troubleshooting)
2. Consulta la documentación completa
3. Abre un [Issue](https://github.com/Andresporahi/AdobePodcast/issues) en GitHub

---

<div align="center">

**¡Disfruta mejorando tus videos con Adobe Podcast! 🎙️✨**

[![Platzi](https://img.shields.io/badge/Platzi-98CA3F?style=for-the-badge&logo=platzi&logoColor=white)](https://platzi.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Andresporahi/AdobePodcast)

---

**v1.0.0** - *Octubre 2025*

</div>
