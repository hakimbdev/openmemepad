#!/bin/bash

# Run script for OpenMemePad on TON blockchain

echo -e "\033[1;36mStarting Open Memepad services...\033[0m"

# Start backend in a new terminal
echo -e "\033[1;33mStarting backend server...\033[0m"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '$(pwd)'/backend && php artisan serve"'
else
    # Linux
    gnome-terminal -- bash -c "cd $(pwd)/backend && php artisan serve; exec bash" || 
    xterm -e "cd $(pwd)/backend && php artisan serve" || 
    konsole -e "cd $(pwd)/backend && php artisan serve" || 
    echo -e "\033[1;31mCould not open a new terminal window. Please run the backend manually in another terminal with: cd backend && php artisan serve\033[0m"
fi

# Start frontend
echo -e "\033[1;33mStarting frontend development server...\033[0m"
npm run dev 