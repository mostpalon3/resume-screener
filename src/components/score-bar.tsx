'use client';

import { motion } from 'framer-motion';

interface ScoreBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreClass(score: number): string {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'average';
  return 'poor';
}

export function getScoreBadgeClass(score: number): string {
  return `score-badge score-badge--${getScoreClass(score)}`;
}

export default function ScoreBar({ score, showLabel = false, size = 'md' }: ScoreBarProps) {
  const scoreClass = getScoreClass(score);
  const height = size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <div className="score-bar" style={{ height }}>
        <motion.div
          className={`score-bar__fill score-bar__fill--${scoreClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: `var(--score-${scoreClass})`, minWidth: '36px' }}>
          {score}%
        </span>
      )}
    </div>
  );
}
