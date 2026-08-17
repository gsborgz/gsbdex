'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Collection, CollectionEntry } from '@models/collection';

const EMPTY_ENTRY: CollectionEntry = { owned: false, fullArt: false };

interface CollectionContextValue {
  getEntry: (id: number | string) => CollectionEntry;
  toggleOwned: (id: number | string) => void;
  toggleFullArt: (id: number | string) => void;
  getExportCode: () => string;
  importFromCode: (code: string) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collection, setCollection] = useState<Collection>({});

  useEffect(() => {
    fetch('/api/collection')
      .then((response) => response.json())
      .then((data: Collection) => setCollection(data))
      .catch(() => setCollection({}));
  }, []);

  const updateEntry = (id: number | string, patch: Partial<CollectionEntry>) => {
    const key = id.toString();
    const current = collection[key] || EMPTY_ENTRY;
    const updated = { ...current, ...patch };

    setCollection((prev) => ({ ...prev, [key]: updated }));

    fetch('/api/collection', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, ...patch }),
    }).catch(() => {
      setCollection((prev) => ({ ...prev, [key]: current }));
    });
  };

  const getEntry = (id: number | string): CollectionEntry => {
    return collection[id.toString()] || EMPTY_ENTRY;
  };

  const toggleOwned = (id: number | string) => {
    updateEntry(id, { owned: !getEntry(id).owned });
  };

  const toggleFullArt = (id: number | string) => {
    updateEntry(id, { fullArt: !getEntry(id).fullArt });
  };

  const getExportCode = (): string => {
    return btoa(encodeURIComponent(JSON.stringify(collection)));
  };

  const importFromCode = async (code: string): Promise<void> => {
    const decoded = JSON.parse(decodeURIComponent(atob(code))) as Collection;

    setCollection(decoded);

    await fetch('/api/collection', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decoded),
    });
  };

  return (
    <CollectionContext.Provider value={{ getEntry, toggleOwned, toggleFullArt, getExportCode, importFromCode }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection(): CollectionContextValue {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }

  return context;
}
