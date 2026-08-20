import { Pokemon, PokemonListResponse, PokemonSpecies } from '@models/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const MIN_POKEMON_ID = 1;
export const MAX_POKEMON_ID = 1025;

const requestCache = new Map<string, Promise<unknown>>();

export function usePokemonList() {
  return cachedFetch<PokemonListResponse>(`pokemon?limit=${MAX_POKEMON_ID}&offset=0`);
};

export function usePokemonDetails(idOrName: string) {
  return cachedFetch<Pokemon>(`pokemon/${idOrName}`);
};

export function usePokemonSpecies(url: string) {
  const id = getPokemonIdFromUrl(url);

  return usePokemonSpeciesById(id.toString());
};

export function usePokemonSpeciesById(idOrName: string) {
  return cachedFetch<PokemonSpecies>(`pokemon-species/${idOrName}`);
};

export function getPokemonIdFromUrl(url: string): number {
  const parts = url.split('/');

  return parseInt(parts[parts.length - 2]);
};

function cachedFetch<T>(endpoint: string): Promise<T> {
  const cached = requestCache.get(endpoint);

  if (cached) {
    return cached as Promise<T>;
  }

  const request = fetchPokeApiData<T>(endpoint).catch((err) => {
    requestCache.delete(endpoint);

    throw err;
  });

  requestCache.set(endpoint, request);

  return request;
};

async function fetchPokeApiData<T>(endpoint: string): Promise<T> {
  const url = `${BASE_URL}/${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch '${url}' data`);
  }

  return response.json() as Promise<T>;
};
