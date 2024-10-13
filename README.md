# Strooper Bot MiniApp

![Strooper Bot Image](public/logo-fullname.png)

[![Telegram](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://t.me/strooper_bot/strooper)](https://t.me/strooper_bot/strooper)

Welcome to **Strooper Bot**, a Telegram MiniApp built to enhance your Telegram experience with Stellar integrations. This bot acts as a non-custodial wallet and provides various decentralized features directly inside Telegram.

## Features

- **Non-custodial Wallet**: Manage your stellar assets directly from Telegram.
- **Passkey Integration**: Securely sign transactions using passkeys.
- **MiniApp for Stellar**: Interact with Stellar blockchain assets seamlessly.

## How to Use

### 1. Launch the App
You can scan the QR code or click the link below to launch the bot directly in Telegram:

[Launch Strooper Bot](https://t.me/strooper_bot/strooper)

Alternatively, you can scan the QR code below to open it directly:

[![Launch QR Code](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://t.me/strooper_bot/strooper)](https://t.me/strooper_bot/strooper)

### 2. Start the Bot
Once in Telegram, click **Start** to begin interacting with the bot. The bot will guide you through setting up your wallet and managing your Stellar assets.

### 3. Reopen the MiniApp
After closing the app, you can relaunch it by typing `/start` in the bot’s chat or by clicking the link above.

## Video Demo

Here’s a quick video walkthrough of how the Strooper Bot MiniApp works:

<iframe src="https://www.loom.com/embed/a7b8b0d2dae4435c8463734e7eacf0a7?sid=3e28296e-a2eb-4943-b68a-69a37c2d3bc9" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen style="width:100%; height:400px;"></iframe>

## Development

This project is built using:

- **Next.js** with the App Router
- **TypeScript**
- **Telegram Bot API** for handling commands and interactions
- **Stellar SDK** for blockchain integrations

### Running Locally

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/strooper-bot.git
Install dependencies:

bash
Copiar código
npm install
Create a .env.local file in the root directory and add your environment variables, including your Telegram bot token:

env
Copiar código
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
Run the development server:

bash
Copiar código
npm run dev
The app will be available at http://localhost:3000.
