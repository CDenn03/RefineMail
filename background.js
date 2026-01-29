chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "improve") {
    const { text, style, instruction } = msg;

    // Use the style and instruction from the message, or fall back to stored values
    const preset = style || "Formal";
    const customInstruction = instruction || "None";

    const prompt = `You are an assistant that improves email drafts.
      Style: ${preset}.
      Extra instruction: ${customInstruction}.
      Improve this email:\n\n${text}`;

    callOpenAI(prompt)
      .then((improved) => {
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "preview",
            original: text,
            improved: improved,
          });
        }
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("OpenAI API error:", error);
        if (sender.tab?.id) {
          chrome.tabs.sendMessage(sender.tab.id, {
            action: "error",
            message: "Failed to improve email. Please try again.",
          });
        }
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep the message channel open for async response
  }
});


// Mock AI for testing


async function callOpenAI(prompt) {
  console.log("Pretending to call OpenAI with prompt:", prompt);

  // Fake improved email (for testing without API key)
  return (
    `✨ [AI-SIMULATED] Here's a polished version:\n\n` +
    prompt.replace("Improve this email:", "").trim().slice(0, 200) +
    " ... [rest of draft polished]"
  );
}