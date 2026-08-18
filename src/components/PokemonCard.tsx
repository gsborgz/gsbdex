'use client'

import Card from '@components/ui/Card';
import { getPokemonIdFromUrl } from '@hooks/useApi';
import { PokemonListItem } from '@models/pokemon';
import Badge from '@components/ui/Badge';
import Checkbox from '@components/ui/Checkbox';
import Image from 'next/image';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useCollection } from '@providers/CollectionProvider';
import { concatClassNames } from '@lib/utils';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  highlighted?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function PokemonCard({ pokemon, highlighted, cardRef }: PokemonCardProps) {
  if (!pokemon) return null;

  const { t } = useTranslation();
  const { getEntry, toggleOwned, toggleFullArt } = useCollection();
  const pokemonId = getPokemonIdFromUrl(pokemon.url);
  const router = useRouter();
  const entry = getEntry(pokemonId);
  const onCardClick = () => {
    router.push(`/pokemon/${pokemonId}`);
  };
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;

    target.src = '/missingno.png';
  };

  return (
    <div
      ref={cardRef}
      className={concatClassNames(
        'rounded-lg transition-shadow duration-300 scroll-mt-20',
        highlighted && 'ring-4 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      <Card onClick={onCardClick} className='cursor-pointer w-full max-w-sm md:w-58'>
        <div className='w-full flex justify-end'><Badge className='bg-slate-200/60 text-slate-600 dark:bg-slate-600/60 dark:text-slate-200'>#{pokemonId.toString().padStart(3, '0')}</Badge></div>

        <Image
          src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/` + pokemonId.toString().padStart(3, '0') + '.png'}
          alt={pokemon.name}
          width={100}
          height={100}
          className='w-32 h-32 md:w-24 md:h-24 mx-auto'
          data-retry-count="0"
          onError={handleImageError}
        />

        <h3 className='text-center text-xl md:text-lg font-semibold capitalize text-primary'>{pokemon.name}</h3>

        <div onClick={(e) => e.stopPropagation()} className='flex justify-center gap-4 mt-4'>
          <Checkbox checked={entry.owned} onChange={() => toggleOwned(pokemonId)} label={t('collection.owned')} />
          <Checkbox checked={entry.fullArt} onChange={() => toggleFullArt(pokemonId)} label={t('collection.fullArt')} />
        </div>
      </Card>
    </div>
  );
}

export default memo(PokemonCard);
