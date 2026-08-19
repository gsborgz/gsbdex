'use client'

import React, { createContext, useContext, useState } from 'react';
import { CollectionFilterOption } from '@models/collection';

interface FilterContextValue {
  filters: Set<CollectionFilterOption>;
  toggleFilter: (option: CollectionFilterOption) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<Set<CollectionFilterOption>>(new Set());

  const toggleFilter = (option: CollectionFilterOption) => {
    setFilters((prev) => {
      const next = new Set(prev);

      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }

      return next;
    });
  };

  return (
    <FilterContext.Provider value={{ filters, toggleFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useCollectionFilters(): FilterContextValue {
  const context = useContext(FilterContext);

  if (!context) {
    throw new Error('useCollectionFilters must be used within a FilterProvider');
  }

  return context;
}
