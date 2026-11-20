@echo off
setlocal

echo Starting CreatorPulse Backend...

cd /d "%~dp0"

if errorlevel 1 (
    echo ERROR: Could not access the project directory.
    pause
    exit /b 1
)

where mvn >nul 2>nul
if errorlevel 1 (
    echo ERROR: Maven is not installed or not available in PATH.
    pause
    exit /b 1
)

call mvn spring-boot:run

pause