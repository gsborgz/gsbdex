'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Collection, CollectionEntry } from '@models/collection';

const EMPTY_ENTRY: CollectionEntry = { owned: false, fullArt: false };

interface CollectionContextValue {
  getEntry: (id: number | string) => CollectionEntry;
  toggleOwned: (id: number | string) => void;
  toggleFullArt: (id: number | string) => void;
  getExportCode: () => Promise<string>;
  importFromCode: (code: string) => Promise<void>;
  ownedCount: number;
  fullArtCount: number;
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

  const ownedCount = Object.values(collection).filter((entry) => entry.owned).length;
  const fullArtCount = Object.values(collection).filter((entry) => entry.fullArt).length;

  const toggleOwned = (id: number | string) => {
    updateEntry(id, { owned: !getEntry(id).owned });
  };

  const toggleFullArt = (id: number | string) => {
    updateEntry(id, { fullArt: !getEntry(id).fullArt });
  };

  const getExportCode = async (): Promise<string> => {
    const response = await fetch('/api/collection/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collection),
    });

    if (!response.ok) {
      throw new Error('Failed to generate export code');
    }

    const { code } = (await response.json()) as { code: string };

    return code;
  };

  const importFromCode = async (code: string): Promise<void> => {
    const response = await fetch(`/api/collection/share/${encodeURIComponent(code)}`);

    if (!response.ok) {
      throw new Error('Invalid code');
    }

    const decoded = (await response.json()) as Collection;

    setCollection(decoded);

    await fetch('/api/collection', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decoded),
    });
  };

  return (
    <CollectionContext.Provider value={{ getEntry, toggleOwned, toggleFullArt, getExportCode, importFromCode, ownedCount, fullArtCount }}>
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
