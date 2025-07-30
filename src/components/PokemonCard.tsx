import Card from '@components/ui/Card';
import { getPokemonIdFromUrl, usePokemonDetails } from '@hooks/useApi';
import { Pokemon, PokemonListItem } from '@models/pokemon';
import Badge from '@components/ui/Badge';
import Image from 'next/image';
import Skeleton from '@components/ui/Skeleton';

interface PokemonCardProps {
  pokemon: PokemonListItem;
  onClick?: () => void;
}

export default function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  const pokemonId = getPokemonIdFromUrl(pokemon.url);
  const { data: pokemonData, isLoading, error } = usePokemonDetails(pokemonId.toString());

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error || !pokemonData) {
    return <ErrorCard message={error?.message} />;
  }

  return <NormalCard pokemon={pokemonData} onClick={onClick} />;
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
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const currentRetryCount = parseInt(img.getAttribute('data-retry-count') || '0');
    const maxRetries = 3; // Aumentado para 3 tentativas
    
    if (currentRetryCount < maxRetries) {
      img.setAttribute('data-retry-count', (currentRetryCount + 1).toString());

      const originalSrc = pokemon?.sprites.front_default;
      if (originalSrc) {
        // Delay progressivo mais agressivo: 2s, 5s, 10s
        const retryDelay = currentRetryCount === 0 ? 2000 : currentRetryCount === 1 ? 5000 : 10000;
        
        setTimeout(() => {
          // Verifica se o elemento ainda existe antes de tentar novamente
          if (img.parentElement) {
            // Remove parâmetros de query anteriores e adiciona novos
            const cleanUrl = originalSrc.split('?')[0];
            img.src = `${cleanUrl}?retry=${currentRetryCount + 1}&t=${Date.now()}&cache=bust`;
          }
        }, retryDelay);
      }
    } else {
      img.src = '/missingno.png';
      // Remove o atributo para limpar
      img.removeAttribute('data-retry-count');
    }
  };

  return (
    <Card onClick={onClick}>
      <div className='w-full flex justify-end'><Badge className='bg-slate-200/60 text-slate-600 dark:bg-slate-600/60 dark:text-slate-200'>#{pokemon.id.toString().padStart(3, '0')}</Badge></div>
      
      <Image
        src={pokemon?.sprites.front_default || '/missingno.png'}
        alt={pokemon.name}
        width={200}
        height={200}
        className='w-24 h-24 mx-auto'
        onError={handleImageError}
        data-retry-count="0"
        unoptimized
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
