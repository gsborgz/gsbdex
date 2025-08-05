'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Pokemon, PokemonSpecies } from '@models/pokemon';
import { usePokemonDetails, usePokemonSpecies } from '@hooks/useApi';
import { ArrowLeft, Ruler, Star, Weight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import Skeleton from '@components/ui/Skeleton';
import Image from 'next/image';
import Badge from '@components/ui/Badge';
import { Select } from '@components/ui/Select';
import Separator from '@components/ui/Separator';
import Card from '@components/ui/Card';

export default function PokemonDetails() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const returnToList = () => {
    router.push('/');
  };

  useEffect(() => {
    const getPokemonDetails = async (id: string) => {
      const pokemonData = await usePokemonDetails(id);
      const speciesData = await usePokemonSpecies(pokemonData.species.url);

      setPokemon(pokemonData);
      setSpecies(speciesData);
    };

    getPokemonDetails(id)
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <section className='flex flex-col gap-4'>
      <div className='container'>
        <Button onClick={returnToList} variant='ghost'>
          <ArrowLeft className='w-4 h-4 ml-2' />
          {t('returnToPokedex')}
        </Button>
      </div>

      <div className='mx-50'>
        <div className='cursor-default border border-slate-400 shadow-md rounded-lg bg-slate-50 dark:bg-slate-950'>
          { (loading && <LoadingDetails />) || (error && <ErrorDetails message={error} />) || (pokemon && <NormalDetails pokemon={pokemon} species={species} />) }
        </div>
      </div>
    </section>
  );
}

function LoadingDetails() {
  return (
    <div className='cursor-default border border-slate-400 rounded-lg'>
      <div className='flex items-center gap-4'>
        <Skeleton className='h-32 w-32 rounded-full' />
        <div className='space-y-2'>
          <Skeleton className='h-8 w-40' />
          <div className='flex gap-2'>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-16 rounded-full' />
          </div>
        </div>
      </div>
      <Skeleton className='h-20 w-full' />
      <Skeleton className='h-40 w-full' />
    </div>
  );
}

function ErrorDetails({ message }: { message: string }) {
  return (
    <div className='text-center text-red-500 p-6'>
      <p>Erro ao carregar os dados da Pokédex: {message}</p>
    </div>
  );
}

function NormalDetails({ pokemon, species }: { pokemon: Pokemon, species: PokemonSpecies | null }) {
  const { t, i18n } = useTranslation();
  const availableVersions = getAvailableVersions(species);
  const initialDescription = getDescription(availableVersions[0].value, species, i18n.language) || t('noDescription');
  const [gameVersion, setGameVersion] = useState<string>(availableVersions[0].value);
  const [versionDescription, setVersionDescription] = useState<string>(initialDescription);
  const [pokemonName, setPokemonName] = useState<string>(getPokemonName(species, i18n.language));
  const [genus, setGenus] = useState<string>(getGenus(species, i18n.language));

  // Usar useEffect para detectar mudanças de idioma
  useEffect(() => {
    const description = getDescription(gameVersion, species, i18n.language) || t('noDescription');
    setVersionDescription(description);
    setPokemonName(getPokemonName(species, i18n.language));
    setGenus(getGenus(species, i18n.language));
  }, [i18n.language, gameVersion, species, t]);

  return (
    <div className='flex flex-col rounded-lg'>
      <div className='flex rounded-t-lg p-6 items-center bg-slate-200 dark:bg-slate-800'>
        <Image
          src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/` + pokemon.id.toString().padStart(3, '0') + '.png'}
          alt={pokemonName}
          width={250}
          height={250}
          className='w-50 h-50'
          data-retry-count='0'
          onError={handleImageError}
        />

        <div className='flex flex-col gap-4 justify-center'>
          <span className='text-sm text-gray-500'>#{pokemon.id.toString().padStart(3, '0')}</span>
          
          <div className='flex flex-col'>
            <span className='text-2xl font-bold capitalize'>{pokemonName}</span>
            <span className='text-sm text-gray-500'>{genus}</span>
          </div>

          <div className='flex gap-2 mt-2'>
            {pokemon?.types.map((type) => (
              <Badge key={type.type.name} className={`type-${type.type.name} text-slate-50 capitalize`}>{t(`type.${type.type.name}`)}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className='flex flex-col p-6 gap-4'>
        <div className='flex gap-2 items-center'>
          <span className='text-lg font-semibold'>{t('description')}</span>

          <Select
            options={availableVersions}
            defaultValue={availableVersions[0].value}
            placeholder={t('selectVersion')}
            onValueChange={(value) => {
              const description = getDescription(value, species, i18n.language) || t('noDescription');

              setVersionDescription(description);
              setGameVersion(value);
            }}
          />
        </div>

        <p className='text-gray-700 dark:text-gray-300'>
          {versionDescription}
        </p>
      </div>

      <Separator className='mx-6' />

      <div className='flex flex-wrap gap-4 justify-center p-6'>
        <Card className='flex-1'>
          <div className='flex flex-col items-center'>
            <Ruler className='h-8 w-8 mx-auto mb-2 text-pokemon-blue' />
            <div className='text-2xl font-bold text-foreground'>
              {(pokemon.height / 10).toFixed(1)}m
            </div>
            <div className='text-sm text-muted-foreground'>{t('height')}</div>
          </div>
        </Card>

        <Card className='flex-1'>
          <div className='flex flex-col items-center'>
            <Weight className='h-8 w-8 mx-auto mb-2 text-pokemon-red' />
            <div className='text-2xl font-bold text-foreground'>
              {(pokemon.weight / 10).toFixed(1)}kg
            </div>
            <div className='text-sm text-muted-foreground'>{t('weight')}</div>
          </div>
        </Card>

        <Card className='flex-1'>
          <div className='flex flex-col items-center'>
            <Star className='h-8 w-8 mx-auto mb-2 text-pokemon-yellow' />
            <div className='text-2xl font-bold text-foreground'>
              {pokemon.base_experience}
            </div>
            <div className='text-sm text-muted-foreground'>{t('baseExperience')}</div>
          </div>
        </Card>
      </div>

      <Separator className='mx-6' />
    </div>
  );
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.target as HTMLImageElement;
  
  target.src = '/missingno.png';
}

function getAvailableVersions(species: PokemonSpecies): { value: string, label: string }[] {
  const { t } = useTranslation();
  const versions = [
    { value: 'red', label: t('version.red') },
    { value: 'blue', label: t('version.blue') },
    { value: 'yellow', label: t('version.yellow') },
    { value: 'gold', label: t('version.gold') },
    { value: 'silver', label: t('version.silver') },
    { value: 'crystal', label: t('version.crystal') },
    { value: 'ruby', label: t('version.ruby') },
    { value: 'sapphire', label: t('version.sapphire') },
    { value: 'emerald', label: t('version.emerald') },
    { value: 'firered', label: t('version.firered') },
    { value: 'leafgreen', label: t('version.leafgreen') },
    { value: 'diamond', label: t('version.diamond') },
    { value: 'pearl', label: t('version.pearl') },
    { value: 'platinum', label: t('version.platinum') },
    { value: 'heartgold', label: t('version.heartgold') },
    { value: 'soulsilver', label: t('version.soulsilver') },
    { value: 'black', label: t('version.black') },
    { value: 'white', label: t('version.white') },
    { value: 'black-2', label: t('version.black-2') },
    { value: 'white-2', label: t('version.white-2') },
    { value: 'x', label: t('version.x') },
    { value: 'y', label: t('version.y') },
    { value: 'omega-ruby', label: t('version.omega-ruby') },
    { value: 'alpha-sapphire', label: t('version.alpha-sapphire') },
    { value: 'sun', label: t('version.sun') },
    { value: 'moon', label: t('version.moon') },
    { value: 'ultra-sun', label: t('version.ultra-sun') },
    { value: 'ultra-moon', label: t('version.ultra-moon') },
    { value: 'lets-go-pikachu', label: t('version.lets-go-pikachu') },
    { value: 'lets-go-eevee', label: t('version.lets-go-eevee') },
    { value: 'sword', label: t('version.sword') },
    { value: 'shield', label: t('version.shield') },
    { value: 'brilliant-diamond', label: t('version.brilliant-diamond') },
    { value: 'shining-pearl', label: t('version.shining-pearl') },
    { value: 'legends-arceus', label: t('version.legends-arceus') },
    { value: 'scarlet', label: t('version.scarlet') },
    { value: 'violet', label: t('version.violet') },
  ];
  const availableVersions = new Set(species?.flavor_text_entries.map(entry => {
    return versions.find(version => version.value === entry.version?.name)
  }).filter(Boolean));

  return Array.from(availableVersions) || [];
}

function getDescription(selectedVersion: string, species: PokemonSpecies, language: string): string {
  if (!selectedVersion) return '';

  const languageCode = language !== 'pt' ? language : 'en';
  const dexEntries = species.flavor_text_entries.filter((entry) => entry.language.name === languageCode);
  const entry = dexEntries?.find((entry) => entry.version?.name === selectedVersion);
  const text = entry?.flavor_text;

  return text ? text?.replace(/\f/g, ' ').trim() : '';
}

function getPokemonName(species: PokemonSpecies, language: string): string {
  const languageCode = language !== 'pt' ? language : 'en';

  return species?.names.find((entry) => entry.language.name === languageCode)?.name || '';
}

function getGenus(species: PokemonSpecies, language: string): string {
  const languageCode = language !== 'pt' ? language : 'en';

  return species?.genera.find((entry) => entry.language.name === languageCode)?.genus;
}
