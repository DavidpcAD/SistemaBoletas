@echo off
title Boletas Adelante
cd /d "%~dp0"

echo.
echo  ==========================================
echo    BOLETAS ADELANTE - Iniciando servidor
echo  ==========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado.
    echo Descargalo en https://nodejs.org ^(version LTS^)
    pause
    exit /b 1
)

echo Node.js encontrado:
node --version

:: Limpiar node_modules si esta incompleto y reinstalar
if exist node_modules (
    echo.
    echo Limpiando node_modules anterior...
    rmdir /s /q node_modules
)

ec