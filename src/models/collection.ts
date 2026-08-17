export interface CollectionEntry {
  owned: boolean;
  fullArt: boolean;
}

export type Collection = Record<string, CollectionEntry>;
