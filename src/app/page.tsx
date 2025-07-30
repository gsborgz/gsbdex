'use client'

import { getPokemonIdFromUrl, usePokemonList } from '@hooks/useApi';
import Skeleton from '@components/ui/Skeleton';
import InfiniteScroll from '@components/InifiniteScroll';
import PokemonCard from '@components/PokemonCard';
import { PokemonListItem } from '../models/pokemon';
import { Search } from 'lucide-react';
import Input from '@components/ui/Input';
import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useState(() => {
    usePokemonList()
      .then((response) => {
        const data = response.results;

        setData(data);
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  if (loading) {
    return <LoadingList />;
  }

  if (error) {
    return <ErrorList message={error.message} />;
  }

  return <NormalList allPokemon={data} />;
}

function LoadingList() {
  return (
    <>
      {/* Filters */}
      <div className='flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left'>
        <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-pokemon-blue to-pokemon-red bg-clip-text text-transparent mb-2'>
          Pokédex
        </h1>
        <p className='text-muted-foreground text-lg'>
          Descubra o mundo dos Pokémon
        </p>
      </div>

      {/* Pokémon list */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className='bg-card rounded-lg p-4 shadow-sm'>
            <div className='text-center space-y-3'>
              <Skeleton className='h-24 w-24 mx-auto rounded-full' />
              <Skeleton className='h-4 w-20 mx-auto' />
              <div className='flex gap-1 justify-center'>
                <Skeleton className='h-5 w-12 rounded-full' />
                <Skeleton className='h-5 w-12 rounded-full' />
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
      <div className='text-center mb-8'>
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

function NormalList({ allPokemon }: { allPokemon: PokemonListItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [displayedCount, setDisplayedCount] = useState(24); // Número inicial de pokémons exibidos
  const itemsPerPage = 12; // Quantos itens carregar por vez
  const filteredPokemon = allPokemon.filter(pokemon => {
    const pokemonId = getPokemonIdFromUrl(pokemon.url);

    if (selectedGeneration) {
      const genRanges = {
        '1': [1, 151],
        '2': [152, 251],
        '3': [252, 386],
        '4': [387, 493],
        '5': [494, 649],
        '6': [650, 721],
        '7': [722, 809],
        '8': [810, 905],
        '9': [906, 1025],
      };

      const [min, max] = genRanges[selectedGeneration as keyof typeof genRanges] || [0, 0];

      if (pokemonId < min || pokemonId > max) {
        return false
      };
    }

    if (searchTerm && !pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });
  const visiblePokemon = filteredPokemon.slice(0, displayedCount);
  const hasNextPage = displayedCount < filteredPokemon.length;
  const loadMorePokemon = () => {
    if (hasNextPage) {
      setDisplayedCount(prev => Math.min(prev + itemsPerPage, filteredPokemon.length));
    }
  };
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setSelectedGeneration('');
    setDisplayedCount(itemsPerPage);
  };

  useEffect(() => {
    setDisplayedCount(itemsPerPage);
  }, [searchTerm, selectedGeneration]);

  return (
    <>
      <div className='text-center mb-8'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Pesquisar Pokémon por nome...'
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <InfiniteScroll
        onLoadMore={loadMorePokemon}
        hasNextPage={hasNextPage}
        isFetchingNextPage={false}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8'>
          {visiblePokemon.map((pokemon) => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}
