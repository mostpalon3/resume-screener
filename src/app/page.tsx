'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Users, FileText, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  _count: { candidates: number };
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this screening and all its candidates?')) return;

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(jobs.filter((j) => j.id !== jobId));
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero__badge">
              <Sparkles size={14} />
              AI-Powered Resume Screening
            </div>

            <h1 className="hero__title">
              Find the Perfect Candidate
              <br />
              <span>in Seconds, Not Hours</span>
            </h1>

            <p className="hero__subtitle">
              Upload resumes and a job description — our intelligent engine analyzes, scores,
              and ranks candidates so you can focus on interviewing the best fit.
            </p>

            <div className="hero__actions">
              <Link href="/jobs/new" className="btn btn--primary btn--lg">
                Start Screening
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recent Screenings */}
      <section className="container" style={{ paddingBottom: 'var(--space-3xl)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 style={{ marginBottom: 'var(--space-lg)' }}>Recent Screenings</h2>

          {loading ? (
            <div className="glass-card glass-card--static" style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div className="analyzing__spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card glass-card--static">
              <div className="empty-state">
                <div className="empty-state__icon">
                  <FileText size={64} />
                </div>
                <h3 className="empty-state__title">No screenings yet</h3>
                <p className="empty-state__text">
                  Create your first screening to start analyzing resumes against job descriptions.
                </p>
                <Link href="/jobs/new" className="btn btn--primary">
                  <Sparkles size={16} />
                  Create First Screening
                </Link>
              </div>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/jobs/${job.id}`} className="glass-card job-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="job-card__info">
                      <div className="job-card__title">{job.title}</div>
                      <div className="job-card__meta">
                        <span className="job-card__stat">
                          <Users size={14} />
                          {job._count.candidates} candidate{job._count.candidates !== 1 ? 's' : ''}
                        </span>
                        <span className="job-card__stat">
                          {formatDate(job.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        className="btn btn--ghost btn--icon"
                        onClick={(e) => deleteJob(job.id, e)}
                        title="Delete screening"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ArrowRight size={18} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}
