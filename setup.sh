#!/bin/bash

# Setup script for OpenMemePad on TON blockchain

echo -e "\033[1;36mSetting up Open Memepad project...\033[0m"

# Step 1: Install frontend dependencies
echo -e "\033[1;33mInstalling frontend dependencies...\033[0m"
npm install

# Step 2: Setup backend
echo -e "\033[1;33mSetting up backend...\033[0m"
cd backend

# Step 3: Install backend dependencies
echo -e "\033[1;33mInstalling Composer dependencies...\033[0m"
composer install

# Step 4: Generate application key
echo -e "\033[1;33mGenerating application key...\033[0m"
php artisan key:generate

# Step 5: Create SQLite database
echo -e "\033[1;33mCreating SQLite database...\033[0m"
mkdir -p database
touch database/database.sqlite
php artisan migrate

# Step 6: Install npm dependencies for backend (if needed)
echo -e "\033[1;33mInstalling backend npm dependencies...\033[0m"
npm install

# Step 7: Return to root directory
cd ..

echo -e "\033[1;32mSetup completed!\033[0m"
echo -e "\033[1;36mTo start the frontend: npm run dev\033[0m"
echo -e "\033[1;36mTo start the backend: cd backend && php artisan serve\033[0m" 