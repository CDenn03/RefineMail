export const AI_MODEL_CONFIG = {

  model: "gpt-4.1-mini", 
  temperature: 0.2,      
  top_p: 1,              
  presence_penalty: 0,   
  frequency_penalty: 0,  
  max_tokens: 1000,      
  
};

export async function callOpenAIAPI(systemPrompt, userPrompt, originalSubject, originalBody) {
  const API_KEY = 'your-openai-api-key-here'; 
  
  if (!API_KEY || API_KEY === 'your-openai-api-key-here') {
    throw new Error('OpenAI API key not configured');
  }
  
  try {
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

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const improvedText = data.choices[0]?.message?.content;
    
    if (!improvedText) {
      throw new Error('No response from OpenAI API');
    }

    const cleanedResponse = cleanAIResponse(improvedText);
    
    const bannedPhrases = ['Here\'s the rewrite', 'Here is the improved', 'dive into', 'game-changer'];
    const hasBannedPhrase = bannedPhrases.some(phrase => 
      cleanedResponse.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasBannedPhrase) {
      console.log("Detected banned phrase, retrying with reminder...");
      
      const retryPrompt = userPrompt + "\n\nReminder: Output rewritten email only. No commentary.";
      
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
          return {
            subject: originalSubject || "Improved Subject",
            body: cleanAIResponse(retryText)
          };
        }
      }
    }

    return {
      subject: originalSubject || "Improved Subject", 
      body: cleanedResponse
    };
    
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    throw error;
  }
}

// Instructions for integrating with real API:
// 1. Replace the mock callOpenAI function in background.js with callOpenAIAPI
// 2. Add your OpenAI API key to the API_KEY constant above
// 3. Import this file in background.js: import { callOpenAIAPI } from './ai-config.js';
// 4. Update the function call: callOpenAIAPI(EMAIL_REWRITE_SYSTEM_PROMPT, userPrompt, subject, text)