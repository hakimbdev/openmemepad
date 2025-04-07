#!/usr/bin/env pwsh

# Setup script for OpenMemePad on TON blockchain

Write-Host "Setting up Open Memepad project..." -ForegroundColor Cyan

# Step 1: Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Setup backend
Write-Host "Setting up backend..." -ForegroundColor Yellow
Set-Location backend

# Step 3: Install backend dependencies
Write-Host "Installing Composer dependencies..." -ForegroundColor Yellow
composer install

# Step 4: Generate application key
Write-Host "Generating application key..." -ForegroundColor Yellow
php artisan key:generate

# Step 5: Create SQLite database
Write-Host "Creating SQLite database..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path database
New-Item -ItemType File -Path database/database.sqlite -Force
php artisan migrate

# Step 6: Install npm dependencies for backend (if needed)
Write-Host "Installing backend npm dependencies..." -ForegroundColor Yellow
npm install

# Step 7: Return to root directory
Set-Location ..

Write-Host "Setup completed!" -ForegroundColor Green
Write-Host "To start the frontend: npm run dev" -ForegroundColor Cyan
Write-Host "To start the backend: cd backend && php artisan serve" -ForegroundColor Cyan 