# AI Email Refiner

> A Chrome extension that rewrites your Gmail and Zimbra emails using GPT-4.1-mini — choose a tone, get a polished draft instantly.

## 🚀 Demo

[Chrome Web Store](#) | [GitHub](#)

## 📋 About

AI Email Refiner injects a floating action button into Gmail and Zimbra compose windows. Click it to select a tone style (Formal, Concise, Friendly, Persuasive, and more), optionally add custom instructions, and receive an AI-rewritten version of your email for review before applying it.

Built for professionals who write a lot of email and want to communicate more clearly without spending time on rewrites.

## ✨ Features

- One-click AI rewriting directly inside Gmail and Zimbra compose windows
- 7 tone styles: Formal, Friendly, Concise, Persuasive, Apologetic, Casual, Neutral/Professional
- Side-by-side original vs. improved preview before applying changes
- Optional custom instructions per rewrite (e.g. "make it more urgent")
- Draggable floating button that adapts to viewport size
- Style preference saved across sessions via `chrome.storage.sync`
- Automatic retry if AI response contains disallowed phrasing

## 🛠 Tech Stack

| Category        | Technology                        |
|-----------------|-----------------------------------|
| Runtime         | Chrome Extension (Manifest V3)    |
| AI              | OpenAI GPT-4.1-mini               |
| Content Scripts | Vanilla JS, MutationObserver API  |
| Background      | Service Worker (ES Module)        |
| Storage         | chrome.storage.sync               |
| Styling         | CSS (injected into host page)     |
| Build           | Custom Node.js build script       |

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- An OpenAI API key
- Google Chrome (or Chromium-based browser)

### Installation

```bash
git clone https://github.com/your-username/ai-email-refiner.git
cd ai-email-refiner
npm install
npm run build
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

## 🔐 Environment Variables

Add your OpenAI API key in `ai-config.js`:

```js
const API_KEY = 'your-openai-api-key-here';
```

> For production use, consider proxying API calls through a backend to avoid exposing your key in the extension bundle.

## 📸 Screenshots

*(Add screenshots here)*

## 📄 License

MIT
