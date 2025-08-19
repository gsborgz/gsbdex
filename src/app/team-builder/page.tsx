'use client'

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { Pen, Check, Plus, Search, Trash } from 'lucide-react';
import Input from '@components/ui/Input';
import InfiniteScroll from '@components/InifiniteScroll';
import { Pokemon, PokemonListItem } from '@models/pokemon';
import { usePokemonList } from '@hooks/useApi';
import PokemonCard from '@components/PokemonCard';

interface PokemonTeam {
  id: string;
  name: string;
  members: PokemonListItem[];
}

export default function TeamBuilder() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'builder' | 'my-teams'>('builder');
  const [teams, setTeams] = useState<PokemonTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<PokemonTeam | null>(null);

  return (
    <section className='flex flex-col gap-6'>
      <div className='grid gap-2 grid-cols-2 bg-slate-200 dark:bg-slate-600 p-1 rounded-md'>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'builder' ? 'bg-slate-100 dark:bg-slate-900 text-primary' : 'text-secondary'}`} onClick={() => setActiveTab('builder')}>{t('teamBuilder.builder')}</p>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'my-teams' ? 'bg-slate-100 dark:bg-slate-900 text-primary' : 'text-secondary'}`} onClick={() => setActiveTab('my-teams')}>{t('teamBuilder.myTeams')}</p>
      </div>

      {activeTab === 'builder' ? (
        <Builder
          teams={teams}
          setTeams={setTeams}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          setActiveTab={setActiveTab}
        />
      ) : (
        <MyTeams
          teams={teams}
          setTeams={setTeams}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          setActiveTab={setActiveTab}
        />
      )}
    </section>
  );
}

function Builder({ teams, setTeams, selectedTeam, setSelectedTeam, setActiveTab }: { teams: PokemonTeam[], setTeams: React.Dispatch<React.SetStateAction<PokemonTeam[]>>, selectedTeam: PokemonTeam, setSelectedTeam: React.Dispatch<React.SetStateAction<PokemonTeam>>, setActiveTab: React.Dispatch<React.SetStateAction<string>> }) {
  const { t } = useTranslation();
  const [data, setData] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canEditTeamName, setCanEditTeamName] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedCount, setDisplayedCount] = useState(24);
  const [teamNameEdit, setTeamNameEdit] = useState(t('teamBuilder.newTeam'));
  const [team, setTeam] = useState<PokemonTeam>({ id: `${new Date().getTime()}-${Math.random().toString(36).slice(2, 11)}`, name: t('teamBuilder.newTeam'), members: [] });
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
  const handlePokemonClick = (pokemon: PokemonListItem) => {
    const { members } = team;
    const exists = members.find(member => member?.id === pokemon.id);

    if (exists) {
      setTeam({ ...team, members: members.filter(member => member?.id !== pokemon.id) });
    } else if (members.length < 6) {
      setTeam({ ...team, members: [...members, pokemon] });
    }
  };
  const handleTitleChange = (newTitle: string) => {
    setTeam({ ...team, name: newTitle });
  };
  const handleSaveTeam = () => {
    if (teams.some(savedTeam => savedTeam.id === team.id)) {
      setTeams(teams.map(savedTeam => (savedTeam.id === team.id ? team : savedTeam)));
    } else {
      setTeams([...teams, team]);
    }

    setSelectedTeam(team);
    setActiveTab('my-teams');

    setTeamNameEdit(null);
    setTeam(null);
  };

  if (selectedTeam) {
    setTeam(selectedTeam);
    setTeamNameEdit(selectedTeam.name);
  }

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
      <div className='flex gap-1 items-center justify-between'>
        <div className='flex gap-2 items-center'>
          {canEditTeamName ? (
            <>
              <div className='w-[80%]'>
                <Input
                  value={teamNameEdit}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamNameEdit(e.target.value)}
                />
              </div>

              <Button
                variant='ghost'
                onClick={() => {
                  handleTitleChange(teamNameEdit);
                  setCanEditTeamName(!canEditTeamName);
                }}
              >
                <Check className='h-4 w-4' />
              </Button>
            </>
          ) : (
            <>
              <p className='text-xl'>{team.name}</p>

              <Button
                variant='ghost'
                onClick={() => {
                  setCanEditTeamName(!canEditTeamName);
                }}
              >
                <Pen className='h-4 w-4' />
              </Button>
            </>
          )}
        </div>

        <Button
          className='text-slate-100 dark:text-slate-900'
          primary
          onClick={handleSaveTeam}
          disabled={team.members.length === 0}
        >
          <Plus className='h-4 w-4 mr-2' />
          {t('teamBuilder.saveTeam')}
        </Button>
      </div>

      <div className='flex gap-2 border border-slate-400 bg-slate-100 dark:bg-slate-900 p-6 rounded-md'>
        {team.members.length > 0 ? (
            team.members.map((member, index) => (
              <PokemonCard key={index} pokemon={member} fromTeamBuilder onClick={(pokemon) => handlePokemonClick(pokemon)} />
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
              onClick={(pokemon) => handlePokemonClick(pokemon)}
            />
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}

function MyTeams({ teams, setTeams, selectedTeam, setSelectedTeam, setActiveTab }: { teams: PokemonTeam[], setTeams: React.Dispatch<React.SetStateAction<PokemonTeam[]>>, selectedTeam: PokemonTeam, setSelectedTeam: React.Dispatch<React.SetStateAction<PokemonTeam>>, setActiveTab: React.Dispatch<React.SetStateAction<string>> }) {
  const { t } = useTranslation();
  const handleRemoveTeam = (id: string) => {
    setTeams(prevTeams => {
      const newTeams = prevTeams.filter(team => team.id !== id);

      return newTeams;
    });
  };
  const handleEditTeam = (id: string) => {
    const teamToEdit = teams.find(team => team.id === id);

    if (teamToEdit) {
      setSelectedTeam(teamToEdit);
      setActiveTab('builder');
    }
  };

  if (!teams || teams.length === 0) {
    return (
      <div className='flex flex-col gap-6'>
        <p className='text-sm text-slate-500'>{t('teamBuilder.noSavedTeams')}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {teams.map((savedTeam, index) => (
        <div key={index} className={`flex flex-col gap-2 border ${savedTeam.id === selectedTeam.id ? 'border-blue-500' : 'border-slate-400'} bg-slate-100 dark:bg-slate-900 p-6 rounded-md`}>
          <div className='flex items-center justify-between flex-1'>
            <p className='text-lg font-semibold'>{savedTeam.name}</p>
            
            <div className='flex gap-2'>
              <Button variant='ghost' onClick={() => handleEditTeam(savedTeam.id)}>
                <Pen className='h-4 w-4' />
              </Button>

              <Button variant='ghost' onClick={() => handleRemoveTeam(savedTeam.id)}>
                <Trash className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex gap-1'>
            {savedTeam.members.map((member, index) => (
              <PokemonCard key={index} pokemon={member} fromTeamBuilder />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
