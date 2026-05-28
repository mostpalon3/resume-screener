import { FileX } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  text?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = 'No results yet',
  text = 'Upload resumes and a job description to get started.',
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <FileX size={64} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn btn--primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
