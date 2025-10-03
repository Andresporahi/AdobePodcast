@echo off
title Adobe Podcast Enhancer - Debug Mode
cd /d "%~dp0"

echo ========================================
echo   Adobe Podcast Enhancer - Debug
echo ========================================
echo.

REM Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no instalado
    pause
    exit /b 1
)
echo [OK] Python instalado

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no instalado
    pause
    exit /b 1
)
echo [OK] Node.js instalado

REM Verificar dependencias
if not exist "node_modules\" (
    echo [ADVERTENCIA] Dependencias no instaladas
    echo Ejecuta: npm install
    pause
)

echo.
echo Iniciando aplicacion...
echo.

REM Iniciar con consola visible para ver errores
python adobe_podcast_gui.py

pause

