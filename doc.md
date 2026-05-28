# Resume Screener — Documentation

## Architecture Overview

- **Frontend**: Next.js app (app directory) with pages and UI components under `src/app` and `src/components`.
- **API**: Server actions and REST endpoints live under `src/app/api/jobs/...` (create job, upload resumes, analyze). See [src/app/api/jobs/route.ts](src/app/api/jobs/route.ts) and [src/app/api/jobs/[jobId]/analyze/route.ts](src/app/api/jobs/[jobId]/analyze/route.ts).
- **Parsing & Extraction**: Uploaded resume files are parsed by `src/lib/parser.ts` (PDFs via `pdf-parse`, Office docs via `officeparser`) then structured fields are extracted by `src/lib/extractor.ts`.
- **Skills Database**: Canonical skill names and aliases are defined in `src/lib/skills-database.ts` and used for normalization and fuzzy matching.
- **Scoring Engine**: Core scoring logic is implemented in `src/lib/scorer.ts`. It produces a weighted score and breakdown for each candidate and supports ranking multiple resumes.
- **Persistence**: Data stored via Prisma client in `src/lib/prisma.ts` (uses `pg`/`PrismaPg` adapter). Database schema and migrations are under `prisma/`.

## Data Flow (high level)

1. Recruiter creates a Job with title + description (or uploads a JD file) via `POST /api/jobs`.
2. Candidates' resumes are uploaded via `POST /api/jobs/[jobId]/upload` — files are parsed and `extractInfo` saves structured fields and raw `resumeText` to the database.
3. When analysis is run (`POST /api/jobs/[jobId]/analyze`), the scoring engine scores all saved candidates against the job description and writes `matchScore`, `rank`, `skillsMatched`, `skillsMissing`, and `scoreBreakdown` back to the DB.

## Scoring Approach

The scorer combines four factors into a single 0–100 score using weighted sum:

- **Keyword Similarity (35%)**
  - Uses tokenization, stopword removal, and Porter stemming (via the `natural` library).
  - Builds normalized term-frequency vectors for JD and resume text and computes cosine similarity.
  - Result scaled to a 0–100 range.

- **Skills Match (30%)**
  - Extracts skills found in the resume text using the canonical skill list in `skills-database.ts`.
  - Compares against skills present in the JD text and returns matched and missing skills.
  - Score = matched / required (scaled to 0–100). If JD has no explicit skills, a default middling score is used.

- **Experience Relevance (20%)**
  - Compares the candidate's `experience` section (if present) against the JD using the same TF/cosine approach.
  - Falls back to the full resume text when `experience` is absent. Returns a lower default when few tokens exist.

- **Education Alignment (15%)**
  - Heuristics check for degree keywords (PhD / Master's / Bachelor's / etc.) and matching fields (computer science, data science, business, etc.).
  - Adds weighted points based on degree and field overlaps; capped to 100.

- Final score = weighted sum of the four factors; results include a detailed breakdown and arrays of `matchedSkills` and `missingSkills`.

Relevant code: [src/lib/scorer.ts](src/lib/scorer.ts) and [src/lib/skills-database.ts](src/lib/skills-database.ts).

## Important Implementation Details

- Text parsing: `src/lib/parser.ts` supports `.pdf`, `.doc`, `.docx` and returns plain text used by extraction and scoring.
- Structured extraction: `src/lib/extractor.ts` detects name, email, phone, skills, experience, education, and summary using regex heuristics and simple section-based slicing.
- Skills normalization: `normalizeSkill()` and alias reverse-lookup ensure synonyms (e.g., `js` → `javascript`) are treated as the same skill.
- Database updates: `analyze` endpoint uses `scoreAndRankResumes()` then runs a Prisma transaction to persist scores and ranks.

## Assumptions & Limitations

- Job description (JD) is expected as plain text; uploading a JD file relies on the same parsing logic and may lose layout.
- Scoring weights and thresholds are heuristic and chosen for a balanced emphasis on keywords and explicit skills; they may need tuning for different roles.
- Resume parsing is text-based — scanned PDFs with images/OCR are not supported and may yield empty or noisy text.
- Skills detection depends on the `SKILL_ALIASES` list; missing aliases may cause false negatives.
- Education/experience heuristics are simple regex/keyword checks and may misclassify complex CVs.
- External libraries required at runtime: `natural`, `pdf-parse`, `officeparser`, `pg`, `@prisma/client`, and their transitive dependencies.
- Environment variable `DATABASE_URL` must be set for Prisma to connect.

## Files To Inspect (quick links)

- Parser: [src/lib/parser.ts](src/lib/parser.ts)
- Extractor: [src/lib/extractor.ts](src/lib/extractor.ts)
- Scorer: [src/lib/scorer.ts](src/lib/scorer.ts)
- Skills DB: [src/lib/skills-database.ts](src/lib/skills-database.ts)
- API: [src/app/api/jobs/route.ts](src/app/api/jobs/route.ts)
- Upload: [src/app/api/jobs/[jobId]/upload/route.ts](src/app/api/jobs/[jobId]/upload/route.ts)
- Analyze: [src/app/api/jobs/[jobId]/analyze/route.ts](src/app/api/jobs/[jobId]/analyze/route.ts)
- Prisma client: [src/lib/prisma.ts](src/lib/prisma.ts)

## Next Steps (suggested)

- Tune weights and thresholds with real JD/resume samples.
- Add tests for `extractInfo`, `extractSkillsFromText`, and `scoreResume` to catch regressions.
- Consider adding OCR support for scanned PDFs and a fallback flow for low-confidence parses.

---
Generated by an automated repo scan on 2026-05-28.
