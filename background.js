import { 
  EMAIL_REWRITE_SYSTEM_PROMPT, 
  createStructuredPrompt, 
  cleanAIResponse, 
  validateEmail, 
  validateStyle 
} from "./prompts/emailRewrite.v1.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "improve") {
    const { subject, text, style, instruction } = msg;

    const emailValidation = validateEmail(text);
    if (!emailValidation.valid) {
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
    
    const userPrompt = createStructuredPrompt(normalizedStyle, text, instruction);

    callOpenAI(EMAIL_REWRITE_SYSTEM_PROMPT, userPrompt, subject, text)
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
async function callOpenAI(systemPrompt, userPrompt, originalSubject, originalBody) {
  console.log("System prompt:", systemPrompt);
  console.log("User prompt:", userPrompt);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const lines = userPrompt.split('\n');
  const styleLine = lines.find(line => line.startsWith('STYLE:'));
  const emailLine = lines.find(line => line.startsWith('EMAIL:'));
  const instructionsLine = lines.find(line => line.startsWith('ADDITIONAL INSTRUCTIONS:'));
  
  const style = styleLine ? styleLine.replace('STYLE:', '').trim() : 'Neutral/Professional';
  const email = emailLine ? emailLine.replace('EMAIL:', '').trim() : originalBody;
  const instructions = instructionsLine ? instructionsLine.replace('ADDITIONAL INSTRUCTIONS:', '').trim() : 'NONE';

  let improvedBody = email;
  
  switch (style) {
    case 'Formal':
      improvedBody = `Dear Recipient,\n\nI hope this message finds you well. ${email.replaceAll(/Hi|Hey/gi, 'Dear').replaceAll(/Thanks/gi, 'Thank you')}\n\nBest regards`;
      break;
    case 'Friendly':
      improvedBody = `Hi there!\n\n${email.replaceAll(/Dear/gi, 'Hi').replaceAll(/Sincerely/gi, 'Thanks!')} 😊\n\nBest,`;
      break;
    case 'Concise':
      improvedBody = email.split('.').slice(0, 2).join('.') + '.';
      break;
    case 'Persuasive':
      improvedBody = `${email}\n\nI believe this presents a valuable opportunity that would benefit us both. I'd appreciate your prompt consideration.`;
      break;
    case 'Apologetic':
      improvedBody = `I apologize for any inconvenience. ${email}\n\nThank you for your understanding.`;
      break;
    case 'Casual':
      improvedBody = email.replaceAll(/Dear/gi, 'Hey').replaceAll(/Sincerely/gi, 'Cheers');
      break;
    default:
      improvedBody = email.replaceAll(/\s+/g, ' ').trim();
  }

  const mockResponses = [
    improvedBody,
    `Here's the rewrite:\n\n${improvedBody}`,
    `"${improvedBody}"`,
    `Here is the improved email:\n${improvedBody}`,
    `**${improvedBody}**`
  ];
  
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  const cleanedResponse = cleanAIResponse(randomResponse);
  
  const bannedPhrases = ['Here\'s the rewrite', 'Here is the improved', 'dive into', 'game-changer'];
  const hasBannedPhrase = bannedPhrases.some(phrase => 
    cleanedResponse.toLowerCase().includes(phrase.toLowerCase())
  );
  
  let finalResponse = cleanedResponse;
  if (hasBannedPhrase) {
    console.log("Detected banned phrase, retrying...");

    finalResponse = improvedBody; 
  }

  return {
    subject: originalSubject || "Improved Subject",
    body: finalResponse
  };
}