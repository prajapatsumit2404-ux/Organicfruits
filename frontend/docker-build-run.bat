@echo off
REM 🐳 Docker Build & Run Script for OrganicFruits
REM ============================================

setlocal enabledelayedexpansion

echo.
echo 🐳 OrganicFruits Docker Setup
echo =============================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker not found
    echo.
    echo Install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo ✅ Docker found
echo.

REM Check for docker-compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  docker-compose not found (trying docker compose)
    docker compose --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose not found
        pause
        exit /b 1
    )
    set "COMPOSE=docker compose"
) else (
    set "COMPOSE=docker-compose"
)

echo ✅ Docker Compose found
echo.

set /p mongodb_uri="Enter your MongoDB Atlas connection string: "
if "!mongodb_uri!"=="" (
    echo Using local MongoDB settings (set MONGODB_URI to use MongoDB Atlas)
    set "mongodb_uri=mongodb://organicfruits:password@mongodb:27017/organicfruits"
)

echo.
echo 🔨 Building Docker images...
echo.

%COMPOSE% build

if errorlevel 1 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build successful
echo.

echo.
echo 🚀 Starting containers...
echo.

REM Set environment variable for docker-compose
setlocal enabledelayedexpansion
set "MONGODB_URI=!mongodb_uri!"

%COMPOSE% up -d

if errorlevel 1 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)

echo.
echo ✅ Containers started successfully!
echo.
echo 📋 Services running:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:5000/api
echo.
echo 🔍 View logs:
echo   %COMPOSE% logs -f
echo.
echo ⏹️  Stop containers:
echo   %COMPOSE% down
echo.
echo 🧹 Clean up (remove volumes):
echo   %COMPOSE% down -v
echo.
pause
