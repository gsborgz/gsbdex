import InfiniteScroll from '@components/InifiniteScroll';
import { usePokemonList } from '@hooks/useApi';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PokemonListItem } from '@models/pokemon';
import { useTranslation } from 'react-i18next';
import { useDebouncedSearchTerm } from '@providers/SearchProvider';
import PokemonCard from './PokemonCard';

const MIN_SEARCH_LENGTH = 2;
const SEARCH_TRAILING_BUFFER = 12;

export default function PokemonList() {
  const { t } = useTranslation();
  const debouncedSearchTerm = useDebouncedSearchTerm();
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [baseCount, setBaseCount] = useState(24);
  const [searchExpansion, setSearchExpansion] = useState(0);
  const [highlightedName, setHighlightedName] = useState<string | null>(null);
  const itemsPerPage = 12;
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const cardRefCallbacks = useRef<Map<string, (el: HTMLDivElement | null) => void>>(new Map());
  const hadSearchExpansion = useRef(false);
  const searchExpansionRef = useRef(0);
  const displayedCount = Math.max(baseCount, searchExpansion);
  const visiblePokemon = data.slice(0, displayedCount);
  const hasNextPage = displayedCount < data.length;

  useEffect(() => {
    searchExpansionRef.current = searchExpansion;
  }, [searchExpansion]);

  // Stable across renders: InfiniteScroll recreates its IntersectionObserver
  // whenever this reference changes, and a freshly (re)observed target fires
  // an immediate callback with its current intersection state. An inline
  // function here would recreate the observer on every load, causing it to
  // keep re-triggering itself in a runaway loop. It extends from the current
  // effective maximum (not just its own previous value) so that scrolling
  // past a search match keeps loading new content immediately, instead of
  // growing invisibly until it catches up to searchExpansion.
  const loadMorePokemon = useCallback(() => {
    setBaseCount(prev => {
      const current = Math.max(prev, searchExpansionRef.current);

      return Math.min(current + itemsPerPage, data.length);
    });
  }, [data.length]);
  const getCardRef = (name: string) => {
    let callback = cardRefCallbacks.current.get(name);

    if (!callback) {
      callback = (el) => {
        if (el) {
          cardRefs.current.set(name, el);
        } else {
          cardRefs.current.delete(name);
        }
      };
      cardRefCallbacks.current.set(name, callback);
    }

    return callback;
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

  useEffect(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    if (term.length < MIN_SEARCH_LENGTH) {
      setSearchExpansion(0);
      setHighlightedName(null);
      return;
    }

    const matchIndex = data.findIndex(pokemon => pokemon.name.toLowerCase().includes(term));

    if (matchIndex === -1) {
      setSearchExpansion(0);
      setHighlightedName(null);
      return;
    }

    setSearchExpansion(Math.min(matchIndex + 1 + SEARCH_TRAILING_BUFFER, data.length));
    setHighlightedName(data[matchIndex].name);
  }, [debouncedSearchTerm, data]);

  useEffect(() => {
    if (!highlightedName) return;

    cardRefs.current.get(highlightedName)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [highlightedName, searchExpansion]);

  useLayoutEffect(() => {
    if (searchExpansion > 0) {
      hadSearchExpansion.current = true;
      return;
    }

    if (hadSearchExpansion.current) {
      hadSearchExpansion.current = false;
      window.scrollTo({ top: 0 });
    }
  }, [searchExpansion]);

  return (
    <div className='flex flex-col gap-6'>
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
              highlighted={pokemon.name === highlightedName}
              cardRef={getCardRef(pokemon.name)}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}
