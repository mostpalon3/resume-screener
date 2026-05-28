'use client';

import ScoreBar from './score-bar';

interface ScoreBreakdownProps {
  breakdown: {
    keywordSimilarity: number;
    skillsMatch: number;
    experienceRelevance: number;
    educationAlignment: number;
  };
}

const LABELS: Record<string, { label: string; weight: string }> = {
  keywordSimilarity: { label: 'Keyword Match', weight: '35%' },
  skillsMatch: { label: 'Skills Match', weight: '30%' },
  experienceRelevance: { label: 'Experience', weight: '20%' },
  educationAlignment: { label: 'Education', weight: '15%' },
};

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  return (
    <div className="breakdown-chart">
      {Object.entries(breakdown).map(([key, value]) => {
        const meta = LABELS[key];
        if (!meta) return null;
        return (
          <div key={key} className="breakdown-item">
            <span className="breakdown-item__label">
              {meta.label}
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginLeft: '4px' }}>
                ({meta.weight})
              </span>
            </span>
            <div className="breakdown-item__bar">
              <ScoreBar score={value} size="sm" />
            </div>
            <span className="breakdown-item__value">{value}</span>
          </div>
        );
      })}
    </div>
  );
}
