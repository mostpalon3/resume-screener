'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Briefcase, Upload, Zap } from 'lucide-react';
import FileDropzone from '@/components/file-dropzone';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jdFile, setJdFile] = useState<File[]>([]);
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState('');

  const steps = [
    { num: 1, label: 'Job Description', icon: Briefcase },
    { num: 2, label: 'Upload Resumes', icon: Upload },
    { num: 3, label: 'Analyze', icon: Zap },
  ];

  const canProceedStep1 = title.trim() && (description.trim() || jdFile.length > 0);
  const canProceedStep2 = resumeFiles.length > 0;

  const handleAnalyze = async () => {
    setIsSubmitting(true);

    try {
      // Step 1: Create Job
      setProgress('Creating job...');
      const jobFormData = new FormData();
      jobFormData.append('title', title);
      if (jdFile.length > 0) {
        jobFormData.append('jdFile', jdFile[0]);
      }
      if (description.trim()) {
        jobFormData.append('description', description);
      }

      const jobRes = await fetch('/api/jobs', { method: 'POST', body: jobFormData });
      if (!jobRes.ok) {
        const err = await jobRes.json();
        throw new Error(err.error || 'Failed to create job');
      }
      const job = await jobRes.json();

      // Step 2: Upload Resumes
      setProgress(`Uploading ${resumeFiles.length} resume${resumeFiles.length > 1 ? 's' : ''}...`);
      const uploadFormData = new FormData();
      resumeFiles.forEach((file) => uploadFormData.append('resumes', file));

      const uploadRes = await fetch(`/api/jobs/${job.id}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      if (!uploadRes.ok) {
        throw new Error('Failed to upload resumes');
      }
      const uploadResult = await uploadRes.json();

      if (uploadResult.uploaded === 0) {
        throw new Error('No resumes could be processed');
      }

      if (uploadResult.errors?.length > 0) {
        toast.warning(`${uploadResult.errors.length} file(s) could not be processed`);
      }

      // Step 3: Analyze
      setProgress('Analyzing resumes against job description...');
      const analyzeRes = await fetch(`/api/jobs/${job.id}/analyze`, { method: 'POST' });
      if (!analyzeRes.ok) {
        throw new Error('Analysis failed');
      }

      const analyzeResult = await analyzeRes.json();
      toast.success(
        `Analysis complete! ${analyzeResult.analyzed} candidates scored. Top score: ${analyzeResult.topScore}%`
      );

      // Navigate to results
      router.push(`/jobs/${job.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
      setIsSubmitting(false);
      setProgress('');
    }
  };

  return (
    <div className="container container--narrow" style={{ paddingTop: 'var(--space-2xl)', paddingBottom: 'var(--space-3xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>New Screening</h1>
        <p style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          Set up your job description, upload resumes, and let AI do the rest.
        </p>

        {/* Step Wizard */}
        <div className="wizard-steps">
          {steps.map((s, index) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={`wizard-step ${
                  step === s.num ? 'wizard-step--active' : step > s.num ? 'wizard-step--completed' : 'wizard-step--pending'
                }`}
              >
                <div className="wizard-step__circle">
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className="wizard-step__label">{s.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`wizard-connector ${step > s.num ? 'wizard-connector--completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="glass-card glass-card--static" style={{ padding: 'var(--space-xl)' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>
                  <Briefcase size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Job Description
                </h3>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <label className="label">Job Title *</label>
                  <input
                    type="text"
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>

                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <label className="label">Description *</label>
                  <textarea
                    className="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the full job description here — including required skills, experience level, education requirements, and responsibilities..."
                    style={{ minHeight: '200px' }}
                  />
                </div>

                <div>
                  <label className="label" style={{ color: 'var(--text-tertiary)' }}>
                    Or upload a JD document (optional)
                  </label>
                  <FileDropzone
                    files={jdFile}
                    onFilesChange={setJdFile}
                    maxFiles={1}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ marginBottom: 'var(--space-lg)' }}>
                  <Upload size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Upload Resumes
                </h3>
                <p style={{ marginBottom: 'var(--space-lg)', fontSize: '0.9375rem' }}>
                  Upload one or more candidate resumes. Supported formats: PDF, DOC, DOCX.
                </p>

                <FileDropzone
                  files={resumeFiles}
                  onFilesChange={setResumeFiles}
                  maxFiles={20}
                  label={`Resumes (${resumeFiles.length} selected)`}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {isSubmitting ? (
                  <div className="analyzing">
                    <div className="analyzing__spinner" />
                    <p className="analyzing__text">{progress}</p>
                    <div className="analyzing__progress">
                      <div className="analyzing__progress-bar" />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>
                      <Zap size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                      Review & Analyze
                    </h3>

                    <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                      <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                      }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                          Job Title
                        </div>
                        <div style={{ fontWeight: 600 }}>{title}</div>
                      </div>

                      <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                      }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                          Job Description
                        </div>
                        <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxHeight: '120px', overflow: 'hidden' }}>
                          {description
                            ? description.substring(0, 300) + (description.length > 300 ? '...' : '')
                            : `Uploaded: ${jdFile[0]?.name}`}
                        </div>
                      </div>

                      <div style={{
                        padding: 'var(--space-md)',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--glass-border)',
                      }}>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                          Resumes to Analyze
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {resumeFiles.length} file{resumeFiles.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: 'var(--space-md)',
                      background: 'var(--primary-glow)',
                      border: '1px solid rgba(124, 58, 237, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      <strong style={{ color: 'var(--primary-light)' }}>What happens next:</strong> Each resume will be
                      parsed, analyzed against the job description, and scored on keyword similarity, skills match,
                      experience relevance, and education alignment.
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {!isSubmitting && (
          <div style={{
            display: 'flex',
            justifyContent: step === 1 ? 'flex-end' : 'space-between',
            marginTop: 'var(--space-lg)',
          }}>
            {step > 1 && (
              <button className="btn btn--secondary" onClick={() => setStep((step - 1) as Step)}>
                <ArrowLeft size={16} />
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                className="btn btn--primary"
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                onClick={() => setStep((step + 1) as Step)}
              >
                Continue
                <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn--primary btn--lg" onClick={handleAnalyze}>
                <Zap size={18} />
                Analyze Resumes
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
