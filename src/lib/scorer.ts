import { extractSkillsFromText, findMatchingSkills } from './skills-database';

// natural is a CJS module — lazy-load it to avoid ESM/Turbopack interop issues
let _natural: typeof import('natural') | null = null;
async function getNatural() {
  if (!_natural) {
    const mod = await import('natural');
    _natural = mod.default ?? mod;
  }
  return _natural;
}

export interface ScoreResult {
  totalScore: number;
  breakdown: {
    keywordSimilarity: number;
    skillsMatch: number;
    experienceRelevance: number;
    educationAlignment: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
}

// Weights for each scoring factor
const WEIGHTS = {
  keywordSimilarity: 0.35,
  skillsMatch: 0.30,
  experienceRelevance: 0.20,
  educationAlignment: 0.15,
};

// Common stopwords to filter out
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
  'you', 'your', 'yours', 'he', 'him', 'his', 'she', 'her', 'hers',
  'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
  'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were',
  'if', 'then', 'than', 'too', 'very', 'just', 'about', 'above',
  'after', 'again', 'all', 'also', 'any', 'because', 'before', 'below',
  'between', 'both', 'but', 'each', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'as', 'into', 'through', 'during', 'out',
  'up', 'down', 'off', 'over', 'under', 'further', 'once',
  'etc', 'e.g', 'i.e', 'vs', 'via',
]);

async function preprocessText(text: string): Promise<string[]> {
  const natural = await getNatural();
  const tokenizer = new natural.WordTokenizer();
  const stemmer = natural.PorterStemmer;
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  return tokens
    .filter((token: string) => token.length > 1)
    .filter((token: string) => !STOPWORDS.has(token))
    .map((token: string) => stemmer.stem(token));
}

function buildTermFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by total tokens
  const total = tokens.length || 1;
  for (const [key, value] of tf) {
    tf.set(key, value / total);
  }
  return tf;
}

function cosineSimilarity(
  tf1: Map<string, number>,
  tf2: Map<string, number>
): number {
  const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (const term of allTerms) {
    const v1 = tf1.get(term) || 0;
    const v2 = tf2.get(term) || 0;
    dotProduct += v1 * v2;
    magnitude1 += v1 * v1;
    magnitude2 += v2 * v2;
  }

  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

async function calculateKeywordSimilarity(resumeText: string, jdText: string): Promise<number> {
  const resumeTokens = await preprocessText(resumeText);
  const jdTokens = await preprocessText(jdText);

  const resumeTF = buildTermFrequency(resumeTokens);
  const jdTF = buildTermFrequency(jdTokens);

  const similarity = cosineSimilarity(resumeTF, jdTF);

  // Scale to 0-100
  return Math.min(Math.round(similarity * 100 * 2.5), 100);
}

function calculateSkillsMatch(
  resumeText: string,
  jdText: string
): { score: number; matched: string[]; missing: string[] } {
  const resumeSkills = extractSkillsFromText(resumeText);
  const jdSkills = extractSkillsFromText(jdText);

  if (jdSkills.length === 0) {
    return { score: 50, matched: resumeSkills.slice(0, 10), missing: [] };
  }

  const { matched, missing } = findMatchingSkills(resumeSkills, jdSkills);
  const score = Math.round((matched.length / jdSkills.length) * 100);

  return { score: Math.min(score, 100), matched, missing };
}

async function calculateExperienceRelevance(
  experienceText: string | null,
  jdText: string
): Promise<number> {
  if (!experienceText) return 20;

  const expTokens = await preprocessText(experienceText);
  const jdTokens = await preprocessText(jdText);

  if (expTokens.length === 0 || jdTokens.length === 0) return 20;

  const expTF = buildTermFrequency(expTokens);
  const jdTF = buildTermFrequency(jdTokens);

  const similarity = cosineSimilarity(expTF, jdTF);
  return Math.min(Math.round(similarity * 100 * 3), 100);
}

function calculateEducationAlignment(
  educationText: string | null,
  jdText: string
): number {
  if (!educationText) return 30;

  const jdLower = jdText.toLowerCase();
  const eduLower = educationText.toLowerCase();

  let score = 30;

  const degreePatterns = [
    { pattern: /\b(?:ph\.?d|doctorate|doctoral)\b/i, weight: 25 },
    { pattern: /\b(?:master'?s?|m\.?s\.?|m\.?tech|m\.?eng|mba|m\.?a\.?)\b/i, weight: 20 },
    { pattern: /\b(?:bachelor'?s?|b\.?s\.?|b\.?tech|b\.?eng|b\.?a\.?|b\.?sc)\b/i, weight: 15 },
    { pattern: /\b(?:associate'?s?|diploma)\b/i, weight: 10 },
  ];

  for (const { pattern, weight } of degreePatterns) {
    if (pattern.test(eduLower) && pattern.test(jdLower)) {
      score += weight;
      break;
    } else if (pattern.test(eduLower)) {
      score += weight * 0.5;
      break;
    }
  }

  const fields = [
    'computer science', 'software engineering', 'information technology',
    'data science', 'electrical engineering', 'mathematics', 'statistics',
    'business', 'finance', 'marketing', 'economics', 'management',
    'design', 'arts', 'communications', 'psychology', 'biology',
    'chemistry', 'physics', 'mechanical engineering', 'civil engineering',
  ];

  for (const field of fields) {
    if (eduLower.includes(field) && jdLower.includes(field)) {
      score += 20;
      break;
    }
  }

  return Math.min(score, 100);
}

export async function scoreResume(
  resumeText: string,
  jdText: string,
  experienceText: string | null = null,
  educationText: string | null = null
): Promise<ScoreResult> {
  const keywordSimilarity = await calculateKeywordSimilarity(resumeText, jdText);
  const skillsResult = calculateSkillsMatch(resumeText, jdText);
  const experienceRelevance = await calculateExperienceRelevance(experienceText || resumeText, jdText);
  const educationAlignment = calculateEducationAlignment(educationText, jdText);

  const totalScore = Math.round(
    keywordSimilarity * WEIGHTS.keywordSimilarity +
    skillsResult.score * WEIGHTS.skillsMatch +
    experienceRelevance * WEIGHTS.experienceRelevance +
    educationAlignment * WEIGHTS.educationAlignment
  );

  return {
    totalScore: Math.min(Math.max(totalScore, 0), 100),
    breakdown: {
      keywordSimilarity,
      skillsMatch: skillsResult.score,
      experienceRelevance,
      educationAlignment,
    },
    matchedSkills: skillsResult.matched,
    missingSkills: skillsResult.missing,
  };
}

// Score multiple resumes against a single JD and rank them
export async function scoreAndRankResumes(
  resumes: Array<{
    id: string;
    text: string;
    experience: string | null;
    education: string | null;
  }>,
  jdText: string
): Promise<Array<{ id: string; result: ScoreResult; rank: number }>> {
  const results = await Promise.all(
    resumes.map(async (resume) => ({
      id: resume.id,
      result: await scoreResume(resume.text, jdText, resume.experience, resume.education),
    }))
  );

  // Sort by total score descending
  results.sort((a, b) => b.result.totalScore - a.result.totalScore);

  // Assign ranks
  return results.map((r, index) => ({
    ...r,
    rank: index + 1,
  }));
}
