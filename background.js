import { 
  EMAIL_REWRITE_SYSTEM_PROMPT, 
  createStructuredPrompt, 
  validateEmail, 
  validateStyle 
} from "./prompts/emailRewrite.v1.js";

import { callOpenAIAPI } from "./ai-config.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "improve") {
    console.log("[DEBUG] Received improve request:", { subject: msg.subject, textLength: msg.text?.length, style: msg.style });
    
    const { subject, text, style, instruction } = msg;

    const emailValidation = validateEmail(text);
    if (!emailValidation.valid) {
      console.log("[DEBUG] Email validation failed:", emailValidation.error);
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "error",
          message: emailValidation.error,
        });
      }
      sendResponse({ success: false, error: emailValidation.error });
      return true;
    }

    const normalizedStyle = validateStyle(style) ? style : "Neutral/Professional";
    console.log("[DEBUG] Normalized style:", normalizedStyle);
    
    const userPrompt = createStructuredPrompt(normalizedStyle, subject, text, instruction);
    console.log("[DEBUG] Created user prompt, calling OpenAI API...");

    callOpenAIAPI(EMAIL_REWRITE_SYSTEM_PROMPT, userPrompt, subject, text)
      .then((improved) => {
        console.log("[DEBUG] OpenAI API success:", improved);
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "preview",
            original: { subject: subject, body: text },
            improved: improved,
          });
        }
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("[DEBUG] OpenAI API error:", error);
        console.error("[DEBUG] Error stack:", error.stack);
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "error",
            message: "Failed to improve email. Please try again.",
          });
        }
        sendResponse({ success: false, error: error.message });
      });
    
    return true; 
  }
});
