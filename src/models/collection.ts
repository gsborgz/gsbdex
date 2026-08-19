export interface CollectionEntry {
  owned: boolean;
  fullArt: boolean;
}

export type Collection = Record<string, CollectionEntry>;

export type CollectionFilterOption = 'notOwned' | 'owned' | 'fullArt';
