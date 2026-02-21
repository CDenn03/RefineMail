// Shared constants for the extension
// This file is loaded in both content scripts and background script

const VALID_STYLES = [
  "Formal",
  "Friendly",
  "Concise",
  "Persuasive",
  "Apologetic",
  "Casual",
  "Neutral/Professional",
];

const STYLE_DESCRIPTIONS = {
  "Formal": "Professional, structured, respectful tone",
  "Friendly": "Warm, approachable, conversational",
  "Concise": "Brief, direct, essential information only",
  "Persuasive": "Compelling, action-oriented, convincing",
  "Apologetic": "Regretful, understanding, solution-focused",
  "Casual": "Relaxed, informal, natural language",
  "Neutral/Professional": "Balanced, clear, business-appropriate"
};


if (typeof globalThis.window !== 'undefined') {
  globalThis.VALID_STYLES = VALID_STYLES;
  globalThis.STYLE_DESCRIPTIONS = STYLE_DESCRIPTIONS;
}

// Export for ES6 modules (background script)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VALID_STYLES, STYLE_DESCRIPTIONS };
}
