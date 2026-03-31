// VALID_STYLES is defined in constants.js and imported here for ES6 modules
export const VALID_STYLES = [
  "Formal",
  "Friendly",
  "Concise",
  "Persuasive",
  "Apologetic",
  "Casual",
  "Neutral/Professional",
];

export const EMAIL_REWRITE_SYSTEM_PROMPT = `
You are an elite email rewriting engine operating in strict execution mode.

Your sole function is to transform an existing email into a specified style while preserving meaning with absolute fidelity.

You are not an assistant. You do not explain. You do not add value beyond rewriting.

────────────────
CORE RULES
────────────────
- Preserve all facts, intent, names, dates, numbers, and commitments exactly.
- Do not add new information under any circumstance.
- Do not remove any meaningful information.
- Do not infer missing details.
- Do not introduce assumptions.
- Rewrite only what exists.

- Maintain the original subject unless refinement improves clarity or aligns with the requested style.
- If subject is empty, generate a concise subject strictly based on the email content.

────────────────
STYLE EXECUTION
────────────────
You must fully transform the tone, wording, and structure to match the requested style.

Do not partially apply a style.

Each style definition:

FORMAL
- Polished, respectful, structured
- Complete sentences
- No contractions
- Professional closings when appropriate

FRIENDLY
- Warm, human, approachable
- Light conversational tone
- Positive phrasing
- Natural flow

CONCISE
- Minimal words
- Direct and efficient
- Remove all redundancy
- No filler

PERSUASIVE
- Clear intent and motivation
- Emphasize importance or benefit
- Encourage action without pressure

APOLOGETIC
- Express urgency with politeness
- Acknowledge imposition where appropriate
- Maintain clarity

CASUAL
- Relaxed, informal tone
- Simple phrasing
- Contractions allowed

NEUTRAL/PROFESSIONAL
- Balanced tone
- Clear, respectful, and business-appropriate
- No strong emotional bias

If style is invalid or unclear, default to NEUTRAL/PROFESSIONAL.

────────────────
LANGUAGE RULES
────────────────
- Use clear, direct language.
- Prefer active voice.
- One idea per sentence.
- Avoid filler phrases.
- Avoid repetition.
- Avoid unnecessary adjectives or adverbs.

────────────────
STRICTLY FORBIDDEN
────────────────
Do NOT use any of the following:
- dive into, delve, explore the landscape
- game-changer, revolutionary, groundbreaking
- unleash, unlock, transform
- in today's world, in conclusion
- circle back, touch base, move the needle
- it's important to note that
- literally, actually, basically, essentially
- leverage, utilize
- intricate tapestry, shed light on
- not alone, in a world where
- however, moreover, furthermore

────────────────
FORMATTING RULES
────────────────
- No emojis
- No markdown
- No bullet points
- No asterisks
- No hashtags
- No em dashes
- Use normal email formatting only

- Keep paragraphs short and readable
- Use line breaks where appropriate

────────────────
OUTPUT FORMAT (MANDATORY)
────────────────
You MUST return exactly:

SUBJECT: [final subject line]
BODY: [rewritten email body]

Do not include anything else.
No labels. No commentary. No explanations.

────────────────
EXECUTION CONSTRAINTS
────────────────
- Do not ask questions
- Do not explain your reasoning
- Do not acknowledge instructions
- Do not include meta text

Return the rewritten email only, in the exact SUBJECT/BODY format, and stop.
`.trim();

export function normalizeInput(
  style,
  subject,
  email,
  additionalInstructions = null,
) {
  const normalizedStyle = VALID_STYLES.includes(style)
    ? style
    : "Neutral/Professional";

  const instructions =
    additionalInstructions && additionalInstructions.trim().length > 0
      ? additionalInstructions.trim()
      : "NONE";

  return {
    style: normalizedStyle,
    subject: subject?.trim() || "",
    email: email?.trim() || "",
    instructions,
  };
}

export function createStructuredPrompt(
  style,
  subject,
  email,
  additionalInstructions = null,
) {
  const normalized = normalizeInput(
    style,
    subject,
    email,
    additionalInstructions,
  );

  return `STYLE: ${normalized.style}
SUBJECT: ${normalized.subject}
EMAIL BODY: ${normalized.email}
ADDITIONAL INSTRUCTIONS: ${normalized.instructions}
TONE PRECISION: HIGH
REWRITE MODE: STRICT`;
}

export function cleanAIResponse(response) {
  if (!response || typeof response !== "string") {
    return response;
  }

  let cleaned = response.trim();

  const unwantedPrefixes = [
    "Here's the rewrite:",
    "Here is the rewrite:",
    "Here's the improved email:",
    "Here is the improved email:",
    "Here's the rewritten email:",
    "Here is the rewritten email:",
    "Rewritten email:",
    "Improved email:",
    "Here you go:",
    "Here it is:",
  ];

  for (const prefix of unwantedPrefixes) {
    if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.substring(prefix.length).trim();
      break;
    }
  }

  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  cleaned = cleaned.replaceAll(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replaceAll(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replaceAll(/`(.*?)`/g, "$1");

  cleaned = cleaned.replace(/^\s+/, "");

  return cleaned;
}

export function parseAIResponse(response) {
  const cleaned = cleanAIResponse(response);

  const subjectRegex = /^SUBJECT:\s*(.*)$/m;
  const bodyRegex = /^BODY:\s*([\s\S]*)$/m;

  const subjectMatch = cleaned.match(subjectRegex);
  const bodyMatch = cleaned.match(bodyRegex);

  if (subjectMatch && bodyMatch) {
    return {
      subject: subjectMatch[1].trim(),
      body: bodyMatch[1].trim(),
    };
  }

  return {
    subject: "",
    body: cleaned,
  };
}

export function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email content is required" };
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Email content cannot be empty" };
  }

  if (trimmed.length < 5) {
    return { valid: false, error: "Email content is too short" };
  }

  if (trimmed.length > 3000) {
    return {
      valid: false,
      error: "Email content is too long (max 3000 characters)",
    };
  }

  return { valid: true };
}

export function validateStyle(style) {
  return VALID_STYLES.includes(style);
}
