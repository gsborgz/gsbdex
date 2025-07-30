import { Pokemon, PokemonListResponse, PokemonSpecies } from '@models/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export function usePokemonList() {
  return fetchPokeApiData<PokemonListResponse>(`pokemon?limit=1025&offset=0`);
};

export function usePokemonDetails(idOrName: string) {
  return fetchPokeApiData<Pokemon>(`pokemon/${idOrName}`);
};

export function usePokemonSpecies(url: string) {
  const id = getPokemonIdFromUrl(url);

  return fetchPokeApiData<PokemonSpecies>(`pokemon-species/${id}`);
};

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/');

  return parseInt(parts[parts.length - 2]);
};

async function fetchPokeApiData<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch '${url}' data`);
  }

  return response.json() as Promise<T>;
};
