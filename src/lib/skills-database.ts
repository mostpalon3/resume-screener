// Common technology skills with aliases for fuzzy matching
export const SKILL_ALIASES: Record<string, string[]> = {
  // Programming Languages
  'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020', 'es2021', 'es2022', 'es2023'],
  'typescript': ['ts'],
  'python': ['py', 'python3', 'python2'],
  'java': ['jdk', 'jre', 'j2ee', 'jee'],
  'c++': ['cpp', 'c plus plus'],
  'c#': ['csharp', 'c sharp', '.net c#'],
  'ruby': ['rb'],
  'go': ['golang'],
  'rust': ['rustlang'],
  'swift': [],
  'kotlin': ['kt'],
  'php': ['php7', 'php8'],
  'scala': [],
  'r': ['rlang', 'r programming'],
  'matlab': [],
  'perl': [],
  'objective-c': ['objc', 'objective c'],
  'dart': [],
  'lua': [],
  'haskell': [],
  'elixir': [],
  'clojure': [],
  'groovy': [],
  'shell': ['bash', 'zsh', 'shell scripting', 'sh'],
  'sql': ['structured query language'],
  'html': ['html5'],
  'css': ['css3', 'cascading style sheets'],

  // Frontend Frameworks/Libraries
  'react': ['reactjs', 'react.js', 'react js'],
  'angular': ['angularjs', 'angular.js', 'angular 2', 'angular 4'],
  'vue': ['vuejs', 'vue.js', 'vue js', 'vue 3'],
  'next.js': ['nextjs', 'next js', 'next'],
  'nuxt': ['nuxtjs', 'nuxt.js'],
  'svelte': ['sveltekit'],
  'ember': ['emberjs', 'ember.js'],
  'backbone': ['backbonejs', 'backbone.js'],
  'jquery': [],
  'redux': ['react-redux'],
  'tailwind css': ['tailwindcss', 'tailwind'],
  'bootstrap': [],
  'material ui': ['mui', 'material-ui'],
  'sass': ['scss'],
  'less': [],
  'webpack': [],
  'vite': [],
  'babel': [],
  'storybook': [],

  // Backend Frameworks
  'node.js': ['nodejs', 'node js', 'node'],
  'express': ['expressjs', 'express.js'],
  'django': [],
  'flask': [],
  'fastapi': ['fast api'],
  'spring': ['spring boot', 'springboot', 'spring framework'],
  'rails': ['ruby on rails', 'ror'],
  'laravel': [],
  'asp.net': ['aspnet', 'asp net', '.net core', 'dotnet'],
  'nestjs': ['nest.js', 'nest'],
  'fastify': [],
  'koa': ['koajs'],
  'gin': [],
  'fiber': [],
  'actix': [],

  // Databases
  'postgresql': ['postgres', 'psql', 'pg'],
  'mysql': ['mariadb'],
  'mongodb': ['mongo'],
  'redis': [],
  'elasticsearch': ['elastic', 'es'],
  'sqlite': [],
  'oracle': ['oracle db', 'oracle database'],
  'sql server': ['mssql', 'ms sql', 'microsoft sql server'],
  'dynamodb': ['dynamo db', 'amazon dynamodb'],
  'cassandra': ['apache cassandra'],
  'firebase': ['firestore', 'firebase firestore'],
  'supabase': [],
  'neo4j': [],
  'couchdb': ['couch db'],

  // Cloud & DevOps
  'aws': ['amazon web services', 'amazon aws'],
  'azure': ['microsoft azure'],
  'gcp': ['google cloud', 'google cloud platform'],
  'docker': ['containerization'],
  'kubernetes': ['k8s'],
  'terraform': [],
  'ansible': [],
  'jenkins': [],
  'github actions': ['gh actions'],
  'gitlab ci': ['gitlab ci/cd'],
  'circleci': ['circle ci'],
  'nginx': [],
  'apache': ['apache httpd'],
  'linux': ['ubuntu', 'centos', 'debian', 'redhat'],
  'ci/cd': ['cicd', 'continuous integration', 'continuous deployment'],
  'vercel': [],
  'heroku': [],
  'netlify': [],

  // Data & AI/ML
  'machine learning': ['ml'],
  'deep learning': ['dl'],
  'natural language processing': ['nlp'],
  'computer vision': ['cv'],
  'tensorflow': ['tf'],
  'pytorch': ['torch'],
  'scikit-learn': ['sklearn'],
  'pandas': [],
  'numpy': [],
  'keras': [],
  'opencv': [],
  'hugging face': ['huggingface', 'transformers'],
  'langchain': [],
  'openai': ['gpt', 'chatgpt'],

  // Tools & Practices
  'git': ['github', 'gitlab', 'bitbucket', 'version control'],
  'agile': ['scrum', 'kanban'],
  'jira': [],
  'confluence': [],
  'figma': [],
  'adobe xd': [],
  'postman': [],
  'swagger': ['openapi'],
  'graphql': ['gql'],
  'rest api': ['restful', 'rest', 'restful api'],
  'grpc': [],
  'websocket': ['websockets', 'ws'],
  'microservices': ['micro services'],
  'serverless': [],
  'tdd': ['test driven development'],
  'unit testing': ['jest', 'mocha', 'jasmine', 'pytest', 'junit'],
  'integration testing': [],
  'e2e testing': ['cypress', 'playwright', 'selenium'],

  // Mobile
  'react native': ['rn'],
  'flutter': [],
  'ionic': [],
  'xamarin': [],
  'android': ['android sdk'],
  'ios': ['ios sdk', 'uikit', 'swiftui'],

  // Data Engineering
  'apache spark': ['spark', 'pyspark'],
  'apache kafka': ['kafka'],
  'airflow': ['apache airflow'],
  'hadoop': ['hdfs', 'mapreduce'],
  'etl': ['extract transform load'],
  'data warehousing': ['data warehouse'],
  'snowflake': [],
  'databricks': [],
  'power bi': ['powerbi'],
  'tableau': [],
  'looker': [],
};

// Build a reverse lookup map: alias -> canonical skill name
const _reverseLookup = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
  _reverseLookup.set(canonical.toLowerCase(), canonical);
  for (const alias of aliases) {
    _reverseLookup.set(alias.toLowerCase(), canonical);
  }
}

export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim();
  return _reverseLookup.get(lower) || skill;
}

export function findMatchingSkills(
  resumeSkills: string[],
  requiredSkills: string[]
): { matched: string[]; missing: string[] } {
  const normalizedResume = new Set(resumeSkills.map((s) => normalizeSkill(s).toLowerCase()));

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    const normalized = normalizeSkill(skill).toLowerCase();
    if (normalizedResume.has(normalized)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  return { matched, missing };
}

export function extractSkillsFromText(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const seen = new Set<string>();

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    const allTerms = [canonical, ...aliases];
    for (const term of allTerms) {
      if (term.length < 2) continue; // skip very short terms like 'r'
      // Use word boundary matching for short terms
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = term.length <= 3
        ? new RegExp(`\\b${escapedTerm}\\b`, 'i')
        : new RegExp(escapedTerm, 'i');

      if (regex.test(lowerText) && !seen.has(canonical.toLowerCase())) {
        seen.add(canonical.toLowerCase());
        found.push(canonical);
        break;
      }
    }
  }

  return found;
}
