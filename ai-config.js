import { parseAIResponse } from "./prompts/emailRewrite.v1.js";

export const AI_MODEL_CONFIG = {

  model: "gpt-4.1-mini", 
  temperature: 0.2,      
  top_p: 1,              
  presence_penalty: 0,   
  frequency_penalty: 0,  
  max_tokens: 1000,      
  
};

export async function callOpenAIAPI(systemPrompt, userPrompt, originalSubject, originalBody) {
  console.log("[DEBUG] callOpenAIAPI called");
  console.log("[DEBUG] System prompt length:", systemPrompt?.length);
  console.log("[DEBUG] User prompt length:", userPrompt?.length);
  
  const API_KEY = 'your-openai-api-key-here'; 
  
  console.log("[DEBUG] API_KEY check:", API_KEY ? "Key exists" : "No key", API_KEY === 'your-openai-api-key-here' ? "(placeholder)" : "(real key)");
  
  if (!API_KEY || API_KEY === 'your-openai-api-key-here') {
    console.error("[DEBUG] API key not configured!");
    throw new Error('OpenAI API key not configured');
  }
  
  try {
    console.log("[DEBUG] Making fetch request to OpenAI...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL_CONFIG.model,
        temperature: AI_MODEL_CONFIG.temperature,
        top_p: AI_MODEL_CONFIG.top_p,
        presence_penalty: AI_MODEL_CONFIG.presence_penalty,
        frequency_penalty: AI_MODEL_CONFIG.frequency_penalty,
        max_tokens: AI_MODEL_CONFIG.max_tokens,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ]
      })
    });

    console.log("[DEBUG] Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] API error response:", errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[DEBUG] API response received:", data);
    const improvedText = data.choices[0]?.message?.content;
    
    console.log("[DEBUG] Improved text:", improvedText);
    
    if (!improvedText) {
      console.error("[DEBUG] No content in API response!");
      throw new Error('No response from OpenAI API');
    }

    console.log("[DEBUG] Parsing AI response...");
    const parsed = parseAIResponse(improvedText);
    console.log("[DEBUG] Parsed response:", parsed);
    
    // Use original subject if AI didn't provide one
    const finalSubject = parsed.subject || originalSubject || "";
    const finalBody = parsed.body;
    
    const bannedPhrases = ['Here\'s the rewrite', 'Here is the improved', 'dive into', 'game-changer'];
    const hasBannedPhrase = bannedPhrases.some(phrase => 
      finalBody.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasBannedPhrase) {
      console.log("Detected banned phrase, retrying with reminder...");
      
      const retryPrompt = userPrompt + "\n\nReminder: Output in SUBJECT:/BODY: format only. No commentary.";
      
      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          ...AI_MODEL_CONFIG,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user", 
              content: retryPrompt
            }
          ]
        })
      });
      
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        const retryText = retryData.choices[0]?.message?.content;
        if (retryText) {
          const retryParsed = parseAIResponse(retryText);
          return {
            subject: retryParsed.subject || originalSubject || "",
            body: retryParsed.body
          };
        }
      }
    }

    return {
      subject: finalSubject,
      body: finalBody
    };
    
  } catch (error) {
    console.error('[DEBUG] OpenAI API call failed:', error);
    console.error('[DEBUG] Error details:', error.message, error.stack);
    throw error;
  }
}

// Instructions for integrating with real API:
// 1. Replace the mock callOpenAI function in background.js with callOpenAIAPI
// 2. Add your OpenAI API key to the API_KEY constant above
// 3. Import this file in background.js: import { callOpenAIAPI } from './ai-config.js';
// 4. Update the function call: callOpenAIAPI(EMAIL_REWRITE_SYSTEM_PROMPT, userPrompt, subject, text)

// Instructions for integrating with real API:
// 1. Replace the mock callOpenAI function in background.js with callOpenAIAPI
// 2. Add your OpenAI API key to the API_KEY constant above
// 3. Import this file in background.js: import { callOpenAIAPI } from './ai-config.js';
// 4. Update the function call: callOpenAIAPI(EMAIL_REWRITE_SYSTEM_PROMPT, userPrompt, subject, text)