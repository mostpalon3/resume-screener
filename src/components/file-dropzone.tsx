'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  label?: string;
}

const DEFAULT_ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function FileDropzone({
  files,
  onFilesChange,
  accept = DEFAULT_ACCEPT,
  maxFiles = 20,
  label,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      onFilesChange(newFiles);
    },
    [files, onFilesChange, maxFiles]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles: maxFiles - files.length,
  });

  const dropzoneClass = [
    'dropzone',
    isDragActive && 'dropzone--active',
    isDragAccept && 'dropzone--accept',
    isDragReject && 'dropzone--reject',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div {...getRootProps()} className={dropzoneClass}>
        <input {...getInputProps()} />
        <div className="dropzone__icon">
          <Upload size={40} />
        </div>
        <p className="dropzone__text">
          {isDragActive ? (
            'Drop files here...'
          ) : (
            <>
              Drag & drop files here, or <span className="dropzone__highlight">browse</span>
            </>
          )}
        </p>
        <p className="dropzone__formats">
          Supported: PDF, DOC, DOCX • Max {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <AnimatePresence>
            {files.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="file-item"
              >
                <FileText size={18} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                <span className="file-item__name">{file.name}</span>
                <span className="file-item__size">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  className="file-item__remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
