chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === "improve") {
    let { text } = msg;

    chrome.storage.sync.get(["preset", "instruction"], async (res) => {
      let prompt = `You are an assistant that improves email drafts.
        Style: ${res.preset || "Formal"}.
        Extra instruction: ${res.instruction || "None"}.
        Improve this email:\n\n${text}`;

      let improved = await callOpenAI(prompt);

      chrome.tabs.sendMessage(sender.tab.id, {
        action: "preview",
        original: text,
        improved: improved,
      });
    });
  }
});

// --------------------
// Mock AI for testing
// --------------------

async function callOpenAI(prompt) {
  console.log("Pretending to call OpenAI with prompt:", prompt);

  // Fake improved email (for testing without API key)
  return (
    `✨ [AI-SIMULATED] Here’s a polished version:\n\n` +
    prompt.replace("Improve this email:", "").trim().slice(0, 200) +
    " ... [rest of draft polished]"
  );
}
