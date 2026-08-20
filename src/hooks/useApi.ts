import { Pokemon, PokemonListResponse, PokemonSpecies } from '@models/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const MIN_POKEMON_ID = 1;
export const MAX_POKEMON_ID = 1025;

export function usePokemonList() {
  return fetchPokeApiData<PokemonListResponse>(`pokemon?limit=${MAX_POKEMON_ID}&offset=0`);
};

export function usePokemonDetails(idOrName: string) {
  return fetchPokeApiData<Pokemon>(`pokemon/${idOrName}`);
};

export function usePokemonSpecies(url: string) {
  const id = getPokemonIdFromUrl(url);

  return fetchPokeApiData<PokemonSpecies>(`pokemon-species/${id}`);
};

export function usePokemonSpeciesById(idOrName: string) {
  return fetchPokeApiData<PokemonSpecies>(`pokemon-species/${idOrName}`);
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
