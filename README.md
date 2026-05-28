# ResumeAI — Intelligent Resume Screening & Candidate Ranking

An AI-powered web application that automates resume screening by comparing uploaded resumes against a Job Description, assigning a matching score (0–100), and ranking candidates from highest to lowest fit.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React, Framer Motion, Vanilla CSS (Glassmorphism) |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | PostgreSQL + Prisma 7 ORM |
| **Resume Parsing** | `pdf-parse` (PDF), `officeparser` (DOC/DOCX) |
| **Scoring Engine** | `natural` (TF-IDF + Cosine Similarity), custom keyword/skill matching |
| **Export** | `xlsx` (SheetJS) for CSV and Excel |

## Features

- **Multi-format Resume Upload** — PDF, DOC, DOCX via drag & drop
- **JD Input** — Paste text or upload a document
- **AI Scoring** — Multi-factor scoring: keyword similarity (35%), skills match (30%), experience relevance (20%), education alignment (15%)
- **Dashboard** — Ranked candidates table with scores, search, sort, and export
- **Candidate Detail** — Score breakdown, matched vs missing skills, full resume preview

---

## Setup Instructions

### Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** installed and running locally (or a remote connection string)

### Step 1: Install PostgreSQL (if not already installed)

**macOS (via Homebrew):**
```bash
brew install postgresql@17
brew services start postgresql@17
```

After PostgreSQL is running, create the database:
```bash
createdb resume_screener
```

> **Note:** If `createdb` is not found, you may need to add PostgreSQL to your PATH:
> ```bash
> echo 'export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"' >> ~/.zshrc
> source ~/.zshrc
> ```

### Step 2: Configure the Database Connection

Edit the `.env` file in the project root and set your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/resume_screener"
```

Adjust `postgres:postgres` to match your PostgreSQL username and password. On macOS Homebrew installs, you can often use your system username with no password:

```env
DATABASE_URL="postgresql://yourusername@localhost:5432/resume_screener"
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Generate Prisma Client & Run Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Step 5: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Click **Start Screening** on the home page
2. **Step 1:** Enter a job title and paste/upload the job description
3. **Step 2:** Drag & drop one or more resumes (PDF, DOC, DOCX)
4. **Step 3:** Review and click **Analyze Resumes**
5. View the ranked results dashboard with scores, skills, and export options

---

## Scoring Algorithm

| Factor | Weight | Method |
|--------|--------|--------|
| Keyword Similarity | 35% | TF-IDF vectorization + Cosine Similarity |
| Skills Match | 30% | Taxonomy-based exact + alias matching (~150 skills) |
| Experience Relevance | 20% | Section-specific cosine similarity |
| Education Alignment | 15% | Degree level + field of study matching |

---

## Project Structure

```
resume-screener/
├── prisma/
│   └── schema.prisma          # Database schema
├── prisma.config.ts            # Prisma 7 config
├── src/
│   ├── app/
│   │   ├── globals.css         # Design system
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── jobs/
│   │   │   ├── new/page.tsx    # Job creation wizard
│   │   │   └── [jobId]/
│   │   │       ├── page.tsx    # Results dashboard
│   │   │       └── candidates/[candidateId]/page.tsx
│   │   └── api/jobs/           # API routes
│   ├── components/             # Reusable UI components
│   └── lib/
│       ├── prisma.ts           # DB client
│       ├── parser.ts           # Resume text extraction
│       ├── extractor.ts        # Info extraction (name, email, skills)
│       ├── scorer.ts           # Scoring engine
│       └── skills-database.ts  # Skills taxonomy
├── .env                        # Environment variables
├── package.json
└── README.md
```
