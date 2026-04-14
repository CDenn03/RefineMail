# AI Email Refiner

> A Chrome extension that rewrites your Gmail and Zimbra emails using GPT-4.1-mini — choose a tone, get a polished draft instantly.

## 🚀 Demo

[GitHub](https://github.com/CDenn03/ai-email-refiner)

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

- [Node.js v18+](https://nodejs.org/)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- Google Chrome (or any Chromium-based browser)

### Installation

**1. Clone the repo**

```bash
git clone https://github.com/CDenn03/ai-email-refiner.git
cd ai-email-refiner
```

**2. Add your API key**

Create a `.env` file in the root of the project:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

**3. Install dependencies and build**

```bash
npm install
npm run build
```

This injects your API key and copies all extension files into the `dist/` folder.

**4. Load the extension in Chrome**

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `dist/` folder from this project

The extension icon will appear in your toolbar. Open Gmail or Zimbra and start a new compose window to use it.

> Your API key is embedded into the local build and never sent anywhere except directly to OpenAI. It is not committed to the repo — `.env` is gitignored.


