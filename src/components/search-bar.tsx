'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search candidates...' }: SearchBarProps) {
  return (
    <div className="toolbar__search">
      <Search size={18} className="toolbar__search-icon" />
      <input
        type="text"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '42px' }}
      />
    </div>
  );
}
