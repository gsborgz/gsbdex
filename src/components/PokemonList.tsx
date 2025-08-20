import InfiniteScroll from '@components/InifiniteScroll';
import { usePokemonList } from '@hooks/useApi';
import { useEffect, useState } from 'react';
import { PokemonListItem } from '@models/pokemon';
import { Search } from 'lucide-react';
import Input from '@components/ui/Input';
import { useTranslation } from 'react-i18next';
import PokemonCard from './PokemonCard';

export default function PokemonList({ onCardClick }: { onCardClick?: (pokemon: PokemonListItem) => void }) {
  const { t } = useTranslation();
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCount, setDisplayedCount] = useState(24);
  const itemsPerPage = 12;
  const filteredPokemon = data.filter(pokemon => {
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

  return (
    <div className='flex flex-col gap-6'>
      <div className='text-center'>
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

      <InfiniteScroll
        onLoadMore={loadMorePokemon}
        hasNextPage={hasNextPage}
        isFetchingNextPage={false}
      >
        <div className='flex flex-wrap gap-4 mb-8 items-center justify-center'>
          {loading && (
            <div className='col-span-full text-center py-4'>
              <p className='text-sm text-slate-500'>{t('loading')}</p>
            </div>
          )}

          {visiblePokemon.length === 0 && !loading && (
            <div className='col-span-full text-center py-4'>
              <p className='text-sm text-slate-500'>{t('noResults')}</p>
            </div>
          )}

          {error && (
            <div className='col-span-full text-center py-4'>
              <p className='text-sm text-slate-500'>{t('error')}</p>
            </div>
          )}

          {visiblePokemon.map((pokemon) => (
            <PokemonCard
              key={pokemon.name}
              pokemon={pokemon}
              fromTeamBuilder
              onClick={onCardClick}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
