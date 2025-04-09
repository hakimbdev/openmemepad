# Open Memepad on TON Blockchain

A decentralized meme token platform built on the TON blockchain.

## Features

- Launch your own meme tokens on TON blockchain
- Connect TON wallet for authentication
- Manage your tokens and balance
- Stake tokens for rewards
- Join the community and engage with other token creators

## Tech Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- Ethers.js for blockchain interactions
- Axios for API requests

### Backend
- Laravel PHP framework
- SQLite database (configurable to MySQL/PostgreSQL)
- Laravel Sanctum for API authentication
- Integration with TON blockchain

## Prerequisites

- Node.js (v16+)
- PHP (v8.1+)
- Composer
- TON Wallet or other compatible wallet extension

## Setup Instructions

### Windows

```bash
# Clone the repositories
git clone https://your-repo-url/openmemepad.git
cd openmemepad
git clone https://github.com/hakimbdev/openmemepadbackend.git backend

# Setup using PowerShell script
.\setup.ps1

# Run the application
.\run.ps1
```

### Linux/Mac

```bash
# Clone the repositories
git clone https://your-repo-url/openmemepad.git
cd openmemepad
git clone https://github.com/hakimbdev/openmemepadbackend.git backend

# Make scripts executable
chmod +x setup.sh run.sh

# Setup using Bash script
./setup.sh

# Run the application
./run.sh
```

### Manual Setup

If the scripts don't work, you can set up manually:

#### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

#### Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies
composer install

# Create and configure .env file
cp .env.example .env
# Edit the .env file with your configuration

# Generate application key
php artisan key:generate

# Create SQLite database
mkdir -p database
touch database/database.sqlite

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

## Configuration

### Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Open Memepad
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

#### Backend (.env)
```
# Update these settings
TON_API_KEY=your_ton_api_key
TON_TESTNET=true
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_WEBHOOK_URL=your_webhook_url
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Usage

1. Access the frontend at: http://localhost:5173
2. Register/Login using your Telegram credentials
3. Connect your TON wallet
4. Launch your token or interact with existing tokens

## Troubleshooting

- If you encounter PHP extension issues, make sure to install the required extensions:
  ```
  # For fileinfo extension
  # Windows: Edit php.ini and uncomment the line: extension=fileinfo
  # Linux: sudo apt-get install php-fileinfo
  # Mac: brew install php-fileinfo
  ```

- If the TON wallet connection fails, make sure you have a compatible wallet extension installed.

## License

MIT
# fullstackopenmempad
# openmemepadpro
