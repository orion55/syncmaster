@echo off
chcp 65001 >nul

set "SCRIPT_PATH=d:\Prog\syncmaster\index.js"

if not exist "%SCRIPT_PATH%" (
    echo Файл "%SCRIPT_PATH%" не найден.
    pause
    exit /b 1
)

node "%SCRIPT_PATH%"
if %errorlevel% neq 0 (
    echo Ошибка при выполнении скрипта.
)

pause
