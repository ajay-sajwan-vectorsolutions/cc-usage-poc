@echo off
echo ========================================
echo  STARTING FRONTEND DEV SERVER
echo ========================================
echo.

echo Killing any existing process on port 3001...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3001') DO (
    echo Killing process on port 3001 (PID: %%P)
    taskkill /PID %%P /F 2>nul
)

echo.
echo Starting webpack dev server...
echo.
echo ========================================
echo  FRONTEND: http://localhost:3001
echo  HOT RELOAD ENABLED
echo ========================================
echo.
npm run dev