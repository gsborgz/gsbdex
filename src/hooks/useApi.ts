import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Pokemon, PokemonListResponse, PokemonSpecies } from '@models/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

export function usePokemonList(limit: number = 6) {
  return useInfiniteQuery({
    queryKey: ['pokemon-list', limit],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const offset = pageParam * limit;
      return fetchPokeApiData<PokemonListResponse>(`pokemon?limit=${limit}&offset=${offset}`);
    },
    getNextPageParam: (lastPage: PokemonListResponse, allPages: PokemonListResponse[]) => {
      if (!lastPage.next) {
        return undefined;
      }

      return allPages.length;
    },
  });
};

export function usePokemonDetails(idOrName: string) {
  return useQuery({
    queryKey: ['pokemon', idOrName],
    queryFn: async () => {
      return fetchPokeApiData<Pokemon>(`pokemon/${idOrName}`);
    },
    enabled: !!idOrName,
  });
};

export function usePokemonSpecies(url: string) {
  const id = getPokemonIdFromUrl(url);

  return useQuery({
    queryKey: ['pokemon-species', id],
    queryFn: async () => {
      return fetchPokeApiData<PokemonSpecies>(`pokemon-species/${id}`);
    },
    enabled: !!url,
  });
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
