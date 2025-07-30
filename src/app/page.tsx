'use client'

import { usePokemonList } from '@hooks/useApi';
import Skeleton from '@components/ui/Skeleton';
import InfiniteScroll from '@components/InifiniteScroll';
import PokemonCard from '@components/PokemonCard';
import { PokemonListItem } from '../models/pokemon';

export default function Home() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = usePokemonList();
  const allPokemon = data?.pages.flatMap(page => page.results) || [];

  if (isLoading) {
    return <LoadingList />;
  }

  if (error) {
    return <ErrorList message={error.message} />;
  }

  return <NormalList allPokemon={allPokemon} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />;
}

function LoadingList() {
  return (
    <>
      {/* Filters */}
      <div className='flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left'>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pokemon-blue to-pokemon-red bg-clip-text text-transparent mb-2">
          Pokédex
        </h1>
        <p className="text-muted-foreground text-lg">
          Descubra o mundo dos Pokémon
        </p>
      </div>

      {/* Pokémon list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg p-4 shadow-sm">
            <div className="text-center space-y-3">
              <Skeleton className="h-24 w-24 mx-auto rounded-full" />
              <Skeleton className="h-4 w-20 mx-auto" />
              <div className="flex gap-1 justify-center">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ErrorList({ message }: { message: string }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pokemon-blue to-pokemon-red bg-clip-text text-transparent mb-2">
          Pokédex
        </h1>
      </div>
      
      <div className="text-center text-red-500">
        <p>Erro ao carregar os dados da Pokédex: {message}</p>
      </div>
    </>
  );
}

function NormalList({ allPokemon, fetchNextPage, hasNextPage, isFetchingNextPage }: { allPokemon: PokemonListItem[]; fetchNextPage: () => void; hasNextPage: boolean; isFetchingNextPage: boolean; }) {
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pokemon-blue to-pokemon-red bg-clip-text text-transparent mb-2">
          Pokédex
        </h1>
        <p className="text-muted-foreground text-lg">
          Descobra o mundo dos Pokémon
        </p>
      </div>

      <InfiniteScroll
        onLoadMore={fetchNextPage}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {allPokemon.map((pokemon) => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>

        {isFetchingNextPage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={`loading-${index}`} className="bg-card rounded-lg p-4 shadow-sm">
                <div className="text-center space-y-3">
                  <Skeleton className="h-24 w-24 mx-auto rounded-full" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                  <div className="flex gap-1 justify-center">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </InfiniteScroll>
    </>
  );
}
