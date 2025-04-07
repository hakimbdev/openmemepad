#!/usr/bin/env pwsh

# Run script for OpenMemePad on TON blockchain

Write-Host "Starting Open Memepad services..." -ForegroundColor Cyan

# Check for running on Windows
if ($IsWindows -or $PSVersionTable.Platform -eq 'Win32NT') {
    # Start backend in a new PowerShell window
    Write-Host "Starting backend server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "Set-Location '$PWD\backend'; php artisan serve"
    
    # Start frontend
    Write-Host "Starting frontend development server..." -ForegroundColor Yellow
    npm run dev
} else {
    # For Linux/Mac (this won't actually run in PowerShell on these platforms, but for completeness)
    Write-Host "This script is designed for Windows. On Linux/Mac, please use run.sh" -ForegroundColor Red
} 