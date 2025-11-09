@echo off
cd /d "%~dp0"

echo Starting development environment...
echo.

echo Checking if dependencies are installed...
if not exist "node_modules" (
    echo Dependencies not found, installing...
    call npm install
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Stopping any existing dev server...
taskkill /f /im node.exe >nul 2>&1

echo Clearing Next.js build cache (keeping dependencies)...
if exist .next rmdir /s /q .next

echo Starting development server...
echo.
echo Opening browser...
start http://localhost:3000

echo.
echo Development server starting...
echo The server will run in a new window.
echo.

start "Listing App Dev Server" cmd /k "npm run dev"
