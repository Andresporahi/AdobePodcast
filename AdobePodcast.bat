@echo off
title Adobe Podcast Enhancer - Platzi Edition
cd /d "%~dp0"

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    msg * "Python no esta instalado. Descargalo desde python.org"
    exit /b 1
)

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    msg * "Node.js no esta instalado. Descargalo desde nodejs.org"
    exit /b 1
)

REM Verificar dependencias Node.js
if not exist "node_modules\" (
    echo Instalando dependencias de Node.js...
    call npm install
)

REM Iniciar aplicación
pythonw adobe_podcast_gui.py

exit

