# Script PowerShell para crear acceso directo en el escritorio
# Adobe Podcast Enhancer - Platzi Edition

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Crear Acceso Directo en Escritorio" -ForegroundColor Green
Write-Host "  Adobe Podcast Enhancer" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Obtener ruta del escritorio
$Desktop = [Environment]::GetFolderPath("Desktop")
Write-Host "Escritorio: $Desktop" -ForegroundColor Cyan

# Ruta del archivo bat RÁPIDO
$TargetPath = Join-Path $PSScriptRoot "AdobePodcast_Rapido.bat"
Write-Host "Destino: $TargetPath" -ForegroundColor Cyan

# Verificar que existe el archivo
if (-not (Test-Path $TargetPath)) {
    # Usar el bat normal si no existe el rápido
    $TargetPath = Join-Path $PSScriptRoot "AdobePodcast.bat"
}

if (-not (Test-Path $TargetPath)) {
    Write-Host ""
    Write-Host "[ERROR] No se encuentra el archivo bat" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

# Nombre del acceso directo
$ShortcutPath = Join-Path $Desktop "Adobe Podcast Enhancer.lnk"

try {
    # Crear objeto WScript.Shell
    $WshShell = New-Object -ComObject WScript.Shell
    
    # Crear el acceso directo
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $TargetPath
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Adobe Podcast Enhancer - Platzi Edition"
    $Shortcut.IconLocation = "imageres.dll,74"  # Icono de audio de Windows
    $Shortcut.Save()
    
    Write-Host ""
    Write-Host "[OK] Acceso directo creado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ubicacion: $ShortcutPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "NOTA: Usa el modo rapido para inicio instantaneo" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "[ERROR] No se pudo crear el acceso directo" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

pause
