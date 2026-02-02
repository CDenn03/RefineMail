chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "improve") {
    const { subject, text, style, instruction } = msg;

    const preset = style || "Formal";
    const customInstruction = instruction || "None";

    const prompt = `You are an assistant that improves email drafts.
      Style: ${preset}.
      Extra instruction: ${customInstruction}.
      
      Subject: ${subject || "(No subject)"}
      
      Improve this email:\n\n${text}`;

    callOpenAI(prompt, subject, text)
      .then((improved) => {
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
        console.error("OpenAI API error:", error);
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


// Mock AI for testing
async function callOpenAI(prompt, originalSubject, originalBody) {
  console.log("Pretending to call OpenAI with prompt:", prompt);

  // Fake improved email (for testing without API key)
  const improvedSubject = originalSubject ? 
    `✨ ${originalSubject}` : 
    "✨ Improved Subject";
    
  const improvedBody = `✨ [AI-SIMULATED] Here's a polished version:\n\n` +
    originalBody.slice(0, 200) + 
    (originalBody.length > 200 ? " ... [rest of draft polished]" : " [polished]");

  return {
    subject: improvedSubject,
    body: improvedBody
  };
}