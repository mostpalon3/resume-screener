'use client';

import Link from 'next/link';
import { FileSearch, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="header__logo">
          <div className="header__logo-icon">
            <FileSearch size={18} />
          </div>
          ResumeAI
        </Link>
        <nav className="header__nav">
          <Link href="/jobs/new" className="btn btn--primary btn--sm">
            <Plus size={16} />
            New Screening
          </Link>
        </nav>
      </div>
    </header>
  );
}
