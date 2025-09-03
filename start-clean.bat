@echo off
echo ========================================
echo  CLEAN SERVER START SCRIPT
echo ========================================
echo.

echo Step 1: Killing any existing Node processes on ports 3001 and 3002...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3001') DO (
    echo Killing process on port 3001 (PID: %%P)
    taskkill /PID %%P /F 2>nul
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3002') DO (
    echo Killing process on port 3002 (PID: %%P)
    taskkill /PID %%P /F 2>nul
)

echo.
echo Step 2: Clearing npm cache...
call npm cache clean --force

echo.
echo Step 3: Removing old build files...
if exist dist rmdir /s /q dist
if exist .cache rmdir /s /q .cache

echo.
echo Step 4: Building the application...
call npm run build

echo.
echo Step 5: Starting the backend server (server.js)...
echo.
echo ========================================
echo  SERVER STARTING ON PORT 3002
echo  API: http://localhost:3002/api/ccusage
echo ========================================
echo.
node server.js