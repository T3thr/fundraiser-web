'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search by student name or ID..."
        className="w-full px-4 py-2 pl-10 border rounded-lg text-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
      />
      <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
    </div>
  );
};

export default SearchBar;
