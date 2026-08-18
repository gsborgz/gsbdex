'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DEBOUNCE_MS = 400;

interface SearchInputContextValue {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchInputContext = createContext<SearchInputContextValue | null>(null);
const DebouncedSearchContext = createContext<string | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearchTerm(searchTerm), DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [searchTerm]);

  const inputValue = useMemo(() => ({ searchTerm, setSearchTerm }), [searchTerm]);

  return (
    <SearchInputContext.Provider value={inputValue}>
      <DebouncedSearchContext.Provider value={debouncedSearchTerm}>
        {children}
      </DebouncedSearchContext.Provider>
    </SearchInputContext.Provider>
  );
}

export function useSearch(): SearchInputContextValue {
  const context = useContext(SearchInputContext);

  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }

  return context;
}

export function useDebouncedSearchTerm(): string {
  const context = useContext(DebouncedSearchContext);

  if (context === null) {
    throw new Error('useDebouncedSearchTerm must be used within a SearchProvider');
  }

  return context;
}
