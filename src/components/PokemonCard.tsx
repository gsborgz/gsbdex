'use client'

import Card from '@components/ui/Card';
import { getPokemonIdFromUrl, usePokemonDetails } from '@hooks/useApi';
import { Pokemon, PokemonListItem } from '@models/pokemon';
import Badge from '@components/ui/Badge';
import Image from 'next/image';
import Skeleton from '@components/ui/Skeleton';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onClick?: (pokemon: PokemonListItem) => void;
  fromTeamBuilder?: boolean;
}

export default function PokemonCard({ pokemon, onClick, fromTeamBuilder }: PokemonCardProps) {
  if (!pokemon) return null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Pokemon | null>(null);
  const pokemonId = getPokemonIdFromUrl(pokemon.url);
  const router = useRouter();
  const onCardClick = () => {
    router.push(`/pokemon/${pokemonId}`);
  };

  useEffect(() => {
    usePokemonDetails(pokemonId.toString())
      .then((pokemonData) => {
        setData(pokemonData);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  return <NormalCard pokemon={data} fromTeamBuilder onClick={(fromTeamBuilder ? () => onClick(pokemon) : onCardClick)} />;
}

function LoadingCard() {
  return (
    <Card className='bg-card rounded-lg p-4 shadow-sm'>
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
  );
}

function ErrorCard({ message }: { message?: string }) {
  const { t } = useTranslation();

  return (
    <Card className="cursor-pointer">
      <div className="text-center text-red-500">
        <p>{t('errorLoadingPokemon', { message: message || t('unknownError') })}</p>
      </div>
    </Card>
  );
}

function NormalCard({ pokemon, onClick, fromTeamBuilder }: { pokemon: Pokemon, onClick: () => void, fromTeamBuilder?: boolean }) {
  const { t } = useTranslation();
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;

    target.src = '/missingno.png';
  };

  return (
    <Card onClick={onClick} className='cursor-pointer w-58'>
      <div className='w-full flex justify-end'><Badge className='bg-slate-200/60 text-slate-600 dark:bg-slate-600/60 dark:text-slate-200'>#{pokemon.id.toString().padStart(3, '0')}</Badge></div>
      
      <Image
        src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/` + pokemon.id.toString().padStart(3, '0') + '.png'}
        alt={pokemon.name}
        width={100}
        height={100}
        className='w-24 h-24 mx-auto'
        data-retry-count="0"
        onError={handleImageError}
      />

      <h3 className='text-center text-lg font-semibold capitalize text-primary'>{pokemon.name}</h3>

      <div className='flex justify-center gap-2 mt-4'>
        {pokemon?.types.map((type) => (
          <Badge key={type.type.name} className={`type-${type.type.name} text-slate-50 capitalize`}>{t(`type.${type.type.name}`)}</Badge>
        ))}
      </div>
    </Card>
  );
}
