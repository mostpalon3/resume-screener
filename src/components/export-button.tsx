'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  jobId: string;
}

export default function ExportButton({ jobId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        className="btn btn--secondary btn--sm"
        onClick={() => handleExport('csv')}
        disabled={isExporting}
      >
        <Download size={14} />
        CSV
      </button>
      <button
        className="btn btn--secondary btn--sm"
        onClick={() => handleExport('xlsx')}
        disabled={isExporting}
      >
        <Download size={14} />
        Excel
      </button>
    </div>
  );
}
