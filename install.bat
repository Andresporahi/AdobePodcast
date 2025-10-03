@echo off
title Instalador - Adobe Podcast Enhancer
color 0B

echo ========================================
echo   INSTALADOR
echo   Adobe Podcast Enhancer v1.0
echo   Platzi Edition
echo ========================================
echo.

echo Este script instalara todas las dependencias necesarias
echo.
pause

echo.
echo [1/4] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python no esta instalado
    echo.
    echo Por favor instala Python 3.8 o superior desde:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
) else (
    python --version
    echo [OK] Python instalado correctamente
)

echo.
echo [2/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no esta instalado
    echo.
    echo Por favor instala Node.js 18 o superior desde:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    node --version
    echo [OK] Node.js instalado correctamente
)

echo.
echo [3/4] Instalando dependencias de Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias Python
    pause
    exit /b 1
) else (
    echo [OK] Dependencias Python instaladas
)

echo.
echo [4/4] Instalando dependencias de Node.js...
call npm install
if errorlevel 1 (
    echo [ERROR] Fallo la instalacion de dependencias Node.js
    pause
    exit /b 1
) else (
    echo [OK] Dependencias Node.js instaladas
)

echo.
echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo Todo esta listo para usar Adobe Podcast Enhancer
echo.
echo Para iniciar la aplicacion, ejecuta: start.bat
echo.
pause

