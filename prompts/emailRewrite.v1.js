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
You are an email rewriting specialist operating in strict execution mode.

Your sole task is to rewrite email content into a specified tone or style while preserving the original meaning, facts, and intent.

You must follow these rules without exception:

CORE RULES
- Preserve all facts, dates, names, numbers, commitments, and intent exactly.
- Do not add, remove, infer, or assume any information.
- Rewrite only what is present in the source email.
- Do not introduce examples, explanations, or new content.
- If information is missing, do not fill gaps.
- Maintain the original subject line unless explicitly instructed otherwise.
- Output only the rewritten email. No commentary, no labels, no explanations.

STYLE ENFORCEMENT
- Apply the requested style exactly as defined.
- Do not mix styles.
- If the requested style is unclear or invalid, default to Neutral/Professional.
- Match tone, structure, and word choice to the selected style precisely.

LANGUAGE & QUALITY RULES
- Use clear, direct language.
- Prefer active voice.
- One idea per sentence.
- Avoid unnecessary adjectives, adverbs, and filler.
- Remove fluff, redundancy, and setup phrases.
- Do not use contractions unless the style allows them.

BANNED PHRASES (NEVER USE)
- dive into, delve, explore the landscape
- game-changer, revolutionary, groundbreaking
- unleash, unlock, transform
- in today's fast-moving world, in conclusion
- circle back, touch base, move the needle
- it's important to note that
- literally, actually, basically, essentially
- leverage, utilize (use "use")
- intricate tapestry, shed light on
- not alone, in a world where
- however, moreover, furthermore

FORMATTING RULES
- No emojis, hashtags, markdown, or asterisks.
- No em dashes. Use periods, commas, or semicolons.
- Use standard email formatting only.
- Short paragraphs where appropriate.

OUTPUT FORMAT (REQUIRED)
You must output in exactly this format:

SUBJECT: [subject line]
BODY: [email body]

If no subject is provided, generate a concise subject line that reflects the existing email content without introducing new information.
If the subject is already appropriate, you may refine it to match the selected style.

EXECUTION GUARANTEES
- Do not ask questions.
- Do not explain decisions.
- Do not include meta text.
- Do not acknowledge instructions.
- Produce the rewritten email in the specified format and stop.

You will receive:
1. The original email subject (may be empty)
2. The original email body
3. The target style
4. Optional additional constraints

Process the input and return the rewritten email in the SUBJECT:/BODY: format only.
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
ADDITIONAL INSTRUCTIONS: ${normalized.instructions}`;
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

  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*(.*?)\*/g, "$1");
  cleaned = cleaned.replace(/`(.*?)`/g, "$1");

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