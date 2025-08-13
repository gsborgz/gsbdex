'use client'

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { Pen, Check, Plus, Search } from 'lucide-react';
import Input from '@components/ui/Input';
import InfiniteScroll from '@components/InifiniteScroll';
import { Pokemon, PokemonListItem } from '@models/pokemon';
import { getPokemonIdFromUrl, usePokemonList } from '@hooks/useApi';
import PokemonCard from '../../components/PokemonCard';

export default function TeamBuilder() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'builder' | 'my-teams'>('builder');
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
    return (
      <div className='text-center'>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center'>
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <section className='flex flex-col gap-4'>
      <div className='grid gap-2 grid-cols-2 bg-slate-200 dark:bg-slate-600 p-1 rounded-md'>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'builder' ? 'bg-slate-100 dark:bg-slate-900 text-primary' : 'text-secondary'}`} onClick={() => setActiveTab('builder')}>{t('teamBuilder.builder')}</p>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'my-teams' ? 'bg-slate-100 dark:bg-slate-900 text-primary' : 'text-secondary'}`} onClick={() => setActiveTab('my-teams')}>{t('teamBuilder.myTeams')}</p>
      </div>

      {activeTab === 'builder' ? (
        <Builder allPokemon={data} />
      ) : (
        <MyTeams />
      )}
    </section>
  );
}

function Builder({ allPokemon }: { allPokemon: PokemonListItem[] }) {
  const { t } = useTranslation();
  const [teamTitle, setTeamTitle] = useState(t('teamBuilder.newTeam'));
  const [teamTitleEdit, setTeamTitleEdit] = useState(t('teamBuilder.newTeam'));
  const [canEditTeamTitle, setCanEditTeamTitle] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<Pokemon | null>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [displayedCount, setDisplayedCount] = useState(24);
  const itemsPerPage = 12;
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
  const handlePokemonClick = (pokemon: Pokemon) => {
    const exists = teamMembers.find(member => member?.id === pokemon.id);
    if (exists) {
      setTeamMembers(teamMembers.filter(member => member?.id !== pokemon.id));
    } else if (teamMembers.length < 6) {
      setTeamMembers([...teamMembers, pokemon]);
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex gap-1 items-center'>
        {canEditTeamTitle ? (
          <>
            <div className='w-[10%]'>
              <Input
                value={teamTitleEdit}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamTitleEdit(e.target.value)}
              />
            </div>

            <Button
              variant='ghost'
              onClick={() => {
                setTeamTitle(teamTitleEdit);
                setCanEditTeamTitle(!canEditTeamTitle);
              }}
            >
              <Check className='h-4 w-4' />
            </Button>
          </>
        ) : (
          <>
            <p className='text-xl'>{teamTitle}</p>

            <Button
              variant='ghost'
              onClick={() => {
                setCanEditTeamTitle(!canEditTeamTitle);
              }}
            >
              <Pen className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>

      <div className='flex gap-2 border border-slate-400 bg-slate-100 dark:bg-slate-900 p-6 rounded-md'>
        {teamMembers.length > 0 ? (
            teamMembers.map((member, index) => (
              <PokemonCard key={member.name} pokemon={visiblePokemon.find(pokemon => pokemon.name === member.name)} fromTeamBuilder onClick={(pokemon) => handlePokemonClick(pokemon)} />
            ))
        ) : (
          <div className='flex-1 text-center p-10'>
            <p className='text-sm text-slate-500'>{t('teamBuilder.noMembers')}</p>
          </div>
        )}
      </div>

      <div className='text-center'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder={t('searchByNamePlaceholder')}
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
            <PokemonCard key={pokemon.name} pokemon={pokemon} fromTeamBuilder onClick={(pokemon) => handlePokemonClick(pokemon)} />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

function MyTeams() {
  return (
    <div>
      {/* Implementar a lógica para exibir os times salvos aqui */}
      <p>Meus times em desenvolvimento...</p>
    </div>
  );
}
