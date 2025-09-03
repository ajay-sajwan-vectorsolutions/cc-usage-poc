#!/bin/bash

echo "========================================"
echo " CLEAN SERVER START SCRIPT"
echo "========================================"
echo ""

echo "Step 1: Killing any existing Node processes on ports 3001 and 3002..."
# Kill processes on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null
# Kill processes on port 3002
lsof -ti:3002 | xargs kill -9 2>/dev/null

echo ""
echo "Step 2: Clearing npm cache..."
npm cache clean --force

echo ""
echo "Step 3: Removing old build files..."
rm -rf dist
rm -rf .cache
rm -rf node_modules/.cache

echo ""
echo "Step 4: Building the application..."
npm run build

echo ""
echo "Step 5: Starting the backend server (server.js)..."
echo ""
echo "========================================"
echo " SERVER STARTING ON PORT 3002"
echo " API: http://localhost:3002/api/ccusage"
echo "========================================"
echo ""
node server.js