'use client'

import { usePokemonList } from '@hooks/useApi';
import Skeleton from '@components/ui/Skeleton';
import InfiniteScroll from '@components/InifiniteScroll';
import PokemonCard from '@components/PokemonCard';
import { PokemonListItem } from '@models/pokemon';
import { Search } from 'lucide-react';
import Input from '@components/ui/Input';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '@components/ui/Card';

export default function Home() {
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
  }, []);

  if (loading) {
    return <LoadingList />;
  }

  if (error) {
    return <ErrorList message={error?.message} />;
  }

  return <NormalList allPokemon={data} />;
}

function LoadingList() {
  return (
    <>
      <div className='text-center mb-8'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='...'
            className='pl-10'
          />
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
        {Array.from({ length: 24 }).map((_, index) => (
          <Card key={index} className='bg-card rounded-lg p-4 shadow-sm'>
            <div className='text-center space-y-3'>
              <div className='w-full flex justify-end'><Skeleton className='h-5 w-12 rounded-full' /></div>

              <Skeleton className='h-24 w-24 mx-auto rounded-full' />
              <Skeleton className='h-4 w-20 mx-auto' />

              <div className='flex justify-center gap-2 mt-4'>
                <Skeleton className='h-5 w-12 rounded-full' />
                <Skeleton className='h-5 w-12 rounded-full' />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

function ErrorList({ message }: { message: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-center text-red-500">
      <p>{t('errorLoadingPokedexData', { message })}</p>
    </div>
  );
}

function NormalList({ allPokemon }: { allPokemon: PokemonListItem[] }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCount, setDisplayedCount] = useState(24);
  const itemsPerPage = 12;
  const filteredPokemon = allPokemon.filter(pokemon => {
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

  useEffect(() => {
    setDisplayedCount(itemsPerPage);
  }, [searchTerm]);

  return (
    <>
      {/* Filters */}
      <div className='text-center mb-8'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder={t('searchByNamePlaceholder')}
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className='pl-10 text-xs md:text-sm'
          />
        </div>
      </div>

      {/* List */}
      <InfiniteScroll
        onLoadMore={loadMorePokemon}
        hasNextPage={hasNextPage}
        isFetchingNextPage={false}
      >
        <div className='flex flex-wrap gap-4 mb-8 items-center justify-center'>
          {visiblePokemon.map((pokemon) => (
            <PokemonCard key={pokemon.name} pokemon={pokemon} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}
