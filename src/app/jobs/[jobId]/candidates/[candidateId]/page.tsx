'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, FileText, Award } from 'lucide-react';
import ScoreBar, { getScoreBadgeClass } from '@/components/score-bar';
import ScoreBreakdown from '@/components/score-breakdown';
import SkillChip from '@/components/skill-chip';

interface CandidateDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  resumeFileName: string;
  resumeText: string;
  matchScore: number;
  rank: number;
  skillsMatched: string[];
  skillsMissing: string[];
  experience: string | null;
  education: string | null;
  summary: string | null;
  scoreBreakdown: {
    keywordSimilarity: number;
    skillsMatch: number;
    experienceRelevance: number;
    educationAlignment: number;
  } | null;
  job: {
    id: string;
    title: string;
  };
}

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ jobId: string; candidateId: string }>;
}) {
  const resolvedParams = use(params);
  const { jobId, candidateId } = resolvedParams;

  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resume'>('overview');

  useEffect(() => {
    fetch(`/api/jobs/${jobId}/candidates/${candidateId}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [jobId, candidateId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div className="analyzing">
          <div className="analyzing__spinner" />
          <p className="analyzing__text">Loading candidate details...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)', textAlign: 'center' }}>
        <h2>Candidate not found</h2>
        <Link href={`/jobs/${jobId}`} className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const scoreColor =
    candidate.matchScore >= 80
      ? 'var(--score-excellent)'
      : candidate.matchScore >= 60
        ? 'var(--score-good)'
        : candidate.matchScore >= 40
          ? 'var(--score-average)'
          : 'var(--score-poor)';

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)', maxWidth: '1000px' }}>
      {/* Back */}
      <Link href={`/jobs/${jobId}`} className="btn btn--ghost" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex' }}>
        <ArrowLeft size={16} />
        Back to {candidate.job.title}
      </Link>

      {/* Header */}
      <motion.div
        className="detail-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="detail-header__info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-sm)' }}>
            <span
              className={`rank-badge ${candidate.rank <= 3 ? `rank-badge--${candidate.rank}` : 'rank-badge--other'}`}
            >
              {candidate.rank}
            </span>
            <h1 className="detail-header__name" style={{ marginBottom: 0 }}>{candidate.name}</h1>
          </div>
          <div className="detail-header__contact">
            {candidate.email && (
              <span className="detail-header__contact-item">
                <Mail size={14} />
                {candidate.email}
              </span>
            )}
            {candidate.phone && (
              <span className="detail-header__contact-item">
                <Phone size={14} />
                {candidate.phone}
              </span>
            )}
            <span className="detail-header__contact-item">
              <FileText size={14} />
              {candidate.resumeFileName}
            </span>
          </div>
        </div>

        <div className="glass-card detail-score" style={{ background: 'var(--glass-bg)' }}>
          <div className="detail-score__value" style={{ color: scoreColor }}>
            {candidate.matchScore}%
          </div>
          <div className="detail-score__label">Match Score</div>
          <div style={{ marginTop: '8px' }}>
            <span className={getScoreBadgeClass(candidate.matchScore)}>
              {candidate.matchScore >= 80
                ? 'Excellent'
                : candidate.matchScore >= 60
                  ? 'Good'
                  : candidate.matchScore >= 40
                    ? 'Average'
                    : 'Low'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Score Breakdown */}
      {candidate.scoreBreakdown && (
        <motion.div
          className="glass-card glass-card--static"
          style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 style={{ marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} style={{ color: 'var(--primary-light)' }} />
            Score Breakdown
          </h3>
          <ScoreBreakdown breakdown={candidate.scoreBreakdown} />
        </motion.div>
      )}

      {/* Skills */}
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="glass-card glass-card--static" style={{ padding: 'var(--space-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--success)' }}>
            ✓ Matched Skills ({(candidate.skillsMatched as string[]).length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(candidate.skillsMatched as string[]).map((skill) => (
              <SkillChip key={skill} skill={skill} type="matched" />
            ))}
            {(candidate.skillsMatched as string[]).length === 0 && (
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>None detected</span>
            )}
          </div>
        </div>

        <div className="glass-card glass-card--static" style={{ padding: 'var(--space-lg)' }}>
          <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--danger)' }}>
            ✗ Missing Skills ({(candidate.skillsMissing as string[]).length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(candidate.skillsMissing as string[]).map((skill) => (
              <SkillChip key={skill} skill={skill} type="missing" />
            ))}
            {(candidate.skillsMissing as string[]).length === 0 && (
              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>All skills matched!</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <button
            className={`btn ${activeTab === 'overview' ? 'btn--primary' : 'btn--ghost'} btn--sm`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`btn ${activeTab === 'resume' ? 'btn--primary' : 'btn--ghost'} btn--sm`}
            onClick={() => setActiveTab('resume')}
          >
            Full Resume
          </button>
        </div>

        <div className="glass-card glass-card--static">
          {activeTab === 'overview' ? (
            <div style={{ padding: 'var(--space-lg)' }}>
              {candidate.summary && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>Summary</h4>
                  <p style={{ lineHeight: 1.7 }}>{candidate.summary}</p>
                </div>
              )}

              {candidate.experience && (
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>Experience</h4>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}>
                    {candidate.experience}
                  </pre>
                </div>
              )}

              {candidate.education && (
                <div>
                  <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>Education</h4>
                  <pre style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                  }}>
                    {candidate.education}
                  </pre>
                </div>
              )}

              {!candidate.summary && !candidate.experience && !candidate.education && (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--space-xl)' }}>
                  No structured sections were extracted. View the full resume text instead.
                </p>
              )}
            </div>
          ) : (
            <div className="resume-preview">{candidate.resumeText}</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
