export const EMAIL_REWRITE_SYSTEM_PROMPT = `
You are an email rewriting specialist. Your only task is to rewrite emails in the specified style.

CRITICAL RULES - NO EXCEPTIONS:
1. Output ONLY the rewritten email text
2. NO commentary, explanations, or meta text
3. NO "Here's the rewrite" or similar phrases
4. NO markdown formatting
5. NO quotes around the output
6. Preserve all facts, dates, names, numbers exactly
7. Do not add new information or examples
8. Apply the requested style precisely

BANNED OUTPUT PATTERNS:
- "Here's the rewrite"
- "Here is the improved email"
- Any explanatory text before/after
- Markdown formatting
- Quotes around the email

STYLE DEFINITIONS:
- Formal: Professional, structured, respectful tone
- Friendly: Warm, approachable, conversational
- Concise: Brief, direct, essential information only
- Persuasive: Compelling, action-oriented, convincing
- Apologetic: Regretful, understanding, solution-focused
- Casual: Relaxed, informal, natural language
- Neutral/Professional: Balanced, clear, business-appropriate

Process the input and output the rewritten email only.
`.trim();


export function normalizeInput(style, email, additionalInstructions = null) {
  const validStyles = ['Formal', 'Friendly', 'Concise', 'Persuasive', 'Apologetic', 'Casual', 'Neutral/Professional'];
  const normalizedStyle = validStyles.includes(style) ? style : 'Neutral/Professional';
  
  const instructions = additionalInstructions?.trim() ? additionalInstructions : 'NONE';
  
  return {
    style: normalizedStyle,
    email: email.trim(),
    instructions: instructions
  };
}

export function createStructuredPrompt(style, email, additionalInstructions = null) {
  const normalized = normalizeInput(style, email, additionalInstructions);
  
  return `STYLE: ${normalized.style}
EMAIL: ${normalized.email}
ADDITIONAL INSTRUCTIONS: ${normalized.instructions}`;
}

export function cleanAIResponse(response) {
  if (!response || typeof response !== 'string') {
    return response;
  }
  
  let cleaned = response.trim();
  
  const unwantedPrefixes = [
    'Here\'s the rewrite:',
    'Here is the rewrite:',
    'Here\'s the improved email:',
    'Here is the improved email:',
    'Here\'s the rewritten email:',
    'Here is the rewritten email:',
    'Rewritten email:',
    'Improved email:',
    'Here you go:',
    'Here it is:'
  ];
  
  for (const prefix of unwantedPrefixes) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }
  
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  
  cleaned = cleaned.replaceAll(/\*\*(.*?)\*\*/g, '$1'); 
  cleaned = cleaned.replaceAll(/\*(.*?)\*/g, '$1'); 
  cleaned = cleaned.replaceAll(/`(.*?)`/g, '$1'); 
  
  return cleaned;
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email content is required' };
  }
  
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email content cannot be empty' };
  }
  
  if (trimmed.length > 3000) {
    return { valid: false, error: 'Email content is too long (max 3000 characters)' };
  }
  
  return { valid: true };
}

export function validateStyle(style) {
  const validStyles = ['Formal', 'Friendly', 'Concise', 'Persuasive', 'Apologetic', 'Casual', 'Neutral/Professional'];
  return validStyles.includes(style);
}