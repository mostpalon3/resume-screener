export interface ExtractedInfo {
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: string | null;
  education: string | null;
  summary: string | null;
}

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{3,4}/;

const SECTION_HEADERS = {
  skills: /(?:^|\n)\s*(?:technical\s+)?skills?(?:\s*(?:&|and)\s*(?:competenc|abilit)ies)?\s*[:;\n]/i,
  experience: /(?:^|\n)\s*(?:work|professional|employment)?\s*experience\s*[:;\n]/i,
  education: /(?:^|\n)\s*education(?:al)?(?:\s+(?:background|qualifications?))?\s*[:;\n]/i,
  summary: /(?:^|\n)\s*(?:professional\s+)?(?:summary|objective|profile|about\s+me)\s*[:;\n]/i,
};

export function extractInfo(text: string): ExtractedInfo {
  return {
    name: extractName(text),
    email: extractEmail(text),
    phone: extractPhone(text),
    skills: extractSkills(text),
    experience: extractSection(text, 'experience'),
    education: extractSection(text, 'education'),
    summary: extractSection(text, 'summary'),
  };
}

function extractName(text: string): string {
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Skip lines that look like emails, phone numbers, URLs, or section headers
    if (EMAIL_REGEX.test(trimmed)) continue;
    if (PHONE_REGEX.test(trimmed)) continue;
    if (/^https?:\/\//i.test(trimmed)) continue;
    if (/^(?:resume|curriculum|cv|page|address)/i.test(trimmed)) continue;

    // Name-like: 2-5 words, mostly letters, reasonable length
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && trimmed.length < 60) {
      const isNameLike = words.every((w) => /^[A-Za-z'.\-]+$/.test(w));
      if (isNameLike) {
        return trimmed;
      }
    }
  }

  // Fallback: first non-empty line
  return lines[0]?.trim().substring(0, 60) || 'Unknown Candidate';
}

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_REGEX);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_REGEX);
  if (match) {
    const phone = match[0].trim();
    // Only return if it looks like a real phone number (at least 7 digits)
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 7 && digits.length <= 15) {
      return phone;
    }
  }
  return null;
}

function extractSection(text: string, sectionKey: keyof typeof SECTION_HEADERS): string | null {
  const headerRegex = SECTION_HEADERS[sectionKey];
  const match = text.match(headerRegex);
  if (!match || match.index === undefined) return null;

  const startIndex = match.index + match[0].length;
  const remainingText = text.substring(startIndex);

  // Find next section header
  const allHeaders = Object.values(SECTION_HEADERS);
  let endIndex = remainingText.length;

  for (const header of allHeaders) {
    if (header === headerRegex) continue;
    const nextMatch = remainingText.match(header);
    if (nextMatch?.index !== undefined && nextMatch.index < endIndex) {
      endIndex = nextMatch.index;
    }
  }

  const section = remainingText.substring(0, endIndex).trim();
  return section.length > 0 ? section : null;
}

function extractSkills(text: string): string[] {
  const skillSection = extractSection(text, 'skills');
  const textToSearch = skillSection || text;

  // Common skill patterns: split by commas, pipes, bullets, newlines
  const rawSkills = textToSearch
    .split(/[,|•·▪▸►\n;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 50)
    .filter((s) => !/^\d+$/.test(s)) // filter pure numbers
    .filter((s) => !EMAIL_REGEX.test(s))
    .filter((s) => !/^(and|or|the|with|for|in|on|at|to|of|a|an)$/i.test(s));

  // Deduplicate
  const seen = new Set<string>();
  const skills: string[] = [];
  for (const skill of rawSkills) {
    const normalized = skill.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      skills.push(skill);
    }
  }

  return skills.slice(0, 50); // Cap at 50 skills
}
