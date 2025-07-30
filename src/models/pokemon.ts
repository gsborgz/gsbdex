export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny?: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  height: number;
  weight: number;
  base_experience: number;
  moves: PokemonMove[];
  species: {
    url: string;
  };
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonSpecies {
  flavor_text_entries: FlavorTextEntry[];
  genera: Genus[];
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: {
    name: string;
  };
}

export interface Genus {
  genus: string;
  language: {
    name: string;
  };
}
