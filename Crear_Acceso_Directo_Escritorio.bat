@echo off
title Crear Acceso Directo en Escritorio
color 0A

echo ========================================
echo   Crear Acceso Directo en Escritorio
echo   Adobe Podcast Enhancer
echo ========================================
echo.

REM Ruta del escritorio
set "DESKTOP=%USERPROFILE%\Desktop"

REM Ruta del archivo bat
set "TARGET=%~dp0AdobePodcast.bat"

REM Nombre del acceso directo
set "SHORTCUT_NAME=Adobe Podcast Enhancer.lnk"

REM Crear acceso directo usando PowerShell
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\%SHORTCUT_NAME%'); $Shortcut.TargetPath = '%TARGET%'; $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.Description = 'Adobe Podcast Enhancer - Platzi Edition'; $Shortcut.Save()"

if errorlevel 1 (
    echo.
    echo [ERROR] No se pudo crear el acceso directo
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Acceso directo creado en el escritorio
echo.
echo Archivo: %DESKTOP%\%SHORTCUT_NAME%
echo.
echo Ya puedes cerrar esta ventana y usar el acceso
echo directo desde tu escritorio.
echo.
pause

