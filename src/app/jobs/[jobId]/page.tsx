'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Trophy, TrendingUp, BarChart3, ArrowLeft, Eye } from 'lucide-react';
import ScoreBar, { getScoreBadgeClass } from '@/components/score-bar';
import SkillChip from '@/components/skill-chip';
import SearchBar from '@/components/search-bar';
import ExportButton from '@/components/export-button';
import EmptyState from '@/components/empty-state';

interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  resumeFileName: string;
  matchScore: number;
  rank: number;
  skillsMatched: string[];
  skillsMissing: string[];
  scoreBreakdown: {
    keywordSimilarity: number;
    skillsMatch: number;
    experienceRelevance: number;
    educationAlignment: number;
  } | null;
  createdAt: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  _count: { candidates: number };
}

export default function JobDashboardPage({ params }: { params: Promise<{ jobId: string }> }) {
  const resolvedParams = use(params);
  const jobId = resolvedParams.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobRes, candidatesRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch(`/api/jobs/${jobId}/candidates?sortBy=${sortBy}`),
      ]);

      if (jobRes.ok) setJob(await jobRes.json());
      if (candidatesRes.ok) setCandidates(await candidatesRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetch(`/api/jobs/${jobId}/candidates?sortBy=${sortBy}&search=${search}`)
        .then((res) => res.json())
        .then(setCandidates)
        .catch(console.error);
    }
  }, [search, sortBy, jobId, loading]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <div className="analyzing">
          <div className="analyzing__spinner" />
          <p className="analyzing__text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-2xl)' }}>
        <EmptyState
          title="Job not found"
          text="This screening may have been deleted."
          actionLabel="Go Home"
          actionHref="/"
        />
      </div>
    );
  }

  const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.matchScore)) : 0;
  const avgScore =
    candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.matchScore, 0) / candidates.length)
      : 0;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)', paddingBottom: 'var(--space-3xl)' }}>
      {/* Back Link */}
      <Link href="/" className="btn btn--ghost" style={{ marginBottom: 'var(--space-lg)', display: 'inline-flex' }}>
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 style={{ marginBottom: 'var(--space-xs)' }}>{job.title}</h1>
        <p style={{ marginBottom: 'var(--space-xl)' }}>
          {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} analyzed
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="stats-grid"
        style={{ marginBottom: 'var(--space-xl)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="glass-card stat-card">
          <div style={{ color: 'var(--primary-light)', marginBottom: 'var(--space-sm)' }}>
            <Users size={20} />
          </div>
          <div className="stat-card__label">Total Candidates</div>
          <div className="stat-card__value">{candidates.length}</div>
        </div>

        <div className="glass-card stat-card">
          <div style={{ color: 'var(--score-excellent)', marginBottom: 'var(--space-sm)' }}>
            <Trophy size={20} />
          </div>
          <div className="stat-card__label">Top Score</div>
          <div className="stat-card__value">{topScore}%</div>
          {candidates.length > 0 && (
            <div className="stat-card__sub">{candidates.find((c) => c.matchScore === topScore)?.name}</div>
          )}
        </div>

        <div className="glass-card stat-card">
          <div style={{ color: 'var(--accent)', marginBottom: 'var(--space-sm)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="stat-card__label">Average Score</div>
          <div className="stat-card__value">{avgScore}%</div>
        </div>

        <div className="glass-card stat-card">
          <div style={{ color: 'var(--warning)', marginBottom: 'var(--space-sm)' }}>
            <BarChart3 size={20} />
          </div>
          <div className="stat-card__label">Above 70%</div>
          <div className="stat-card__value">
            {candidates.filter((c) => c.matchScore >= 70).length}
          </div>
          <div className="stat-card__sub">qualified candidates</div>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="toolbar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <SearchBar value={search} onChange={setSearch} />
        <div className="toolbar__actions">
          <select
            className="input"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
          <ExportButton jobId={jobId} />
        </div>
      </motion.div>

      {/* Candidates Table */}
      <motion.div
        className="glass-card glass-card--static"
        style={{ overflow: 'hidden' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {candidates.length === 0 ? (
          <EmptyState
            title="No candidates found"
            text={search ? 'Try a different search term.' : 'Upload resumes to get started.'}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="candidate-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Rank</th>
                  <th>Candidate</th>
                  <th style={{ width: '200px' }}>Match Score</th>
                  <th>Key Skills</th>
                  <th>Missing</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <motion.tr
                    key={candidate.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <td>
                      <span
                        className={`rank-badge ${
                          candidate.rank <= 3 ? `rank-badge--${candidate.rank}` : 'rank-badge--other'
                        }`}
                      >
                        {candidate.rank}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{candidate.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                        {candidate.email || candidate.resumeFileName}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={getScoreBadgeClass(candidate.matchScore)}>
                          {candidate.matchScore}%
                        </span>
                        <div style={{ flex: 1 }}>
                          <ScoreBar score={candidate.matchScore} size="sm" />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(candidate.skillsMatched as string[]).slice(0, 3).map((skill) => (
                          <SkillChip key={skill} skill={skill} type="matched" />
                        ))}
                        {(candidate.skillsMatched as string[]).length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '4px 8px' }}>
                            +{(candidate.skillsMatched as string[]).length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(candidate.skillsMissing as string[]).slice(0, 2).map((skill) => (
                          <SkillChip key={skill} skill={skill} type="missing" />
                        ))}
                        {(candidate.skillsMissing as string[]).length > 2 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '4px 8px' }}>
                            +{(candidate.skillsMissing as string[]).length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/jobs/${jobId}/candidates/${candidate.id}`}
                        className="btn btn--ghost btn--icon"
                        title="View details"
                      >
                        <Eye size={16} />
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
