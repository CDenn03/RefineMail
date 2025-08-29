const OPENAI_API_KEY = "YOUR_API_KEY_HERE";

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.action === "improve") {
    let { text } = msg;

    // Get preset + instruction from popup
    chrome.storage.sync.get(["preset", "instruction"], async (res) => {
      let prompt = `You are an assistant that improves email drafts. 
      Preset: ${res.preset || "Formal"}.
      Extra instruction: ${res.instruction || "None"}.
      Improve this email:\n\n${text}`;

      let improved = await callOpenAI(prompt);

      chrome.tabs.sendMessage(sender.tab.id, {
        action: "replace",
        text: improved
      });
    });
  }
});

async function callOpenAI(prompt) {
  let response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    })
  });

  let data = await response.json();
  return data.choices[0].message.content.trim();
}
