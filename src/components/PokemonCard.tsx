import Card from '@components/ui/Card';
import { getPokemonIdFromUrl, usePokemonDetails } from '@hooks/useApi';
import { Pokemon, PokemonListItem } from '@models/pokemon';
import Badge from '@components/ui/Badge';
import Image from 'next/image';
import Skeleton from '@components/ui/Skeleton';
import { useState } from 'react';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onClick?: () => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Pokemon | null>(null);
  const pokemonId = getPokemonIdFromUrl(pokemon.url);
  
  useState(() => {
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
  });

  if (loading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorCard message={error} />;
  }

  return <NormalCard pokemon={data} onClick={onClick} />;
}

function LoadingCard() {
  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg">
      <div className="text-center space-y-3">
        <Skeleton className="h-24 w-24 mx-auto rounded-full" />
        <Skeleton className="h-4 w-20 mx-auto" />
        <div className="flex gap-1 justify-center">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

function ErrorCard({ message }: { message?: string }) {
  return (
    <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg">
      <div className="text-center text-red-500">
        <p>Erro ao carregar os dados do Pokémon: {message || 'Erro desconhecido'}</p>
      </div>
    </Card>
  );
}

function NormalCard({ pokemon, onClick }: { pokemon: Pokemon, onClick: () => void }) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;

    target.src = '/missingno.png';
  };
  
  return (
    <Card onClick={onClick}>
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
          <Badge key={type.type.name} className={`type-${type.type.name} text-slate-50 capitalize`}>{type.type.name}</Badge>
        ))}
      </div>
    </Card>
  );
}
