'use client'

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/ui/Button';
import { Pen, Check, Plus, Trash, CloudDownload, CloudUpload } from 'lucide-react';
import Input from '@components/ui/Input';
import { PokemonListItem } from '@models/pokemon';
import PokemonList from '@components/PokemonList';
import Image from 'next/image';
import { getPokemonIdFromUrl } from '@hooks/useApi';

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
          setSelectedTeam={setSelectedTeam}
          setActiveTab={setActiveTab}
        />
      )}
    </section>
  );
}

function Builder({ teams, setTeams, selectedTeam, setSelectedTeam, setActiveTab }: { teams: PokemonTeam[], setTeams: React.Dispatch<React.SetStateAction<PokemonTeam[]>>, selectedTeam: PokemonTeam | null, setSelectedTeam: React.Dispatch<React.SetStateAction<PokemonTeam | null>>, setActiveTab: React.Dispatch<React.SetStateAction<string>> }) {
  const { t } = useTranslation();
  const [canEditTeamName, setCanEditTeamName] = useState(false);
  const [teamNameEdit, setTeamNameEdit] = useState(t('teamBuilder.newTeam'));
  const [team, setTeam] = useState<PokemonTeam>({ id: `${new Date().getTime()}-${Math.random().toString(36).slice(2, 11)}`, name: t('teamBuilder.newTeam'), members: [] });
  const addPokemonToTeam = (pokemon: PokemonListItem) => {
    const { members } = team;

    if (members.length < 6) {
      setTeam({ ...team, members: [...members, pokemon] });
    }
  };
  const removePokemonFromTeam = (index: number) => {
    const { members } = team;

    if (members[index]) {
      setTeam({ ...team, members: members.filter((_, i) => i !== index) });
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

    setActiveTab('my-teams');
    setTeamNameEdit(t('teamBuilder.newTeam'));
    setTeam({ id: `${new Date().getTime()}-${Math.random().toString(36).slice(2, 11)}`, name: t('teamBuilder.newTeam'), members: [] });
    setSelectedTeam(null);
  };

  useEffect(() => {
    if (selectedTeam) {
      setTeam(selectedTeam);
      setTeamNameEdit(selectedTeam.name);
    }
  }, [selectedTeam]);

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

      {!!team.members.length && (
        <>
          <div className='flex flex-wrap items-center justify-center gap-2 md:gap-4 border border-slate-400 bg-slate-100 dark:bg-slate-900 p-2 lg:p-6 rounded-md'>
            {team.members.map((member, index) => (
              <MemberCard key={index} data={member} onClick={() => removePokemonFromTeam(index)} />
            ))}
          </div>
        </>
      )}

      {!team.members.length && (
        <div className='flex-1 text-center p-10'>
          <p className='text-sm text-slate-500'>{t('teamBuilder.noMembers')}</p>
        </div>
      )}

      <PokemonList onCardClick={addPokemonToTeam} />
    </div>
  );
}

function MyTeams({ teams, setTeams, setSelectedTeam, setActiveTab }: { teams: PokemonTeam[], setTeams: React.Dispatch<React.SetStateAction<PokemonTeam[]>>, setSelectedTeam: React.Dispatch<React.SetStateAction<PokemonTeam | null>>, setActiveTab: React.Dispatch<React.SetStateAction<string>> }) {
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
  const handleImportTeams = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json, .json';

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file || file.type !== 'application/json') return;

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error(t('teamBuilder.invalidFileFormat'));
        }

        const normalized = parsed.map((item: any) => ({
          id: typeof item.id === 'string' ? item.id : `${new Date().getTime()}-${Math.random().toString(36).slice(2, 11)}`,
          name: typeof item.name === 'string' ? item.name : String(item.name ?? 'Imported Team'),
          members: Array.isArray(item.members) ? item.members : []
        }));

        setTeams(normalized);
      } catch (err) {
        console.error(t('teamBuilder.failedToImportTeams'), err);
      }
    };

    input.click();
  };
  const handleExportTeams = () => {
    try {
      const json = JSON.stringify(teams, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      anchor.href = url;
      anchor.download = `gsbdex-teams-${timestamp}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(t('teamBuilder.failedToExportTeams'), err);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-center gap-2'>
        <Button
          className='text-slate-100 dark:text-slate-900'
          primary
          onClick={handleImportTeams}
        >
          <CloudUpload className='h-4 w-4 mr-2' />
          {t('teamBuilder.importTeams')}
        </Button>

        <Button
          className='text-slate-100 dark:text-slate-900'
          primary
          onClick={handleExportTeams}
          disabled={teams.length === 0}
        >
          <CloudDownload className='h-4 w-4 mr-2' />
          {t('teamBuilder.exportTeams')}
        </Button>
      </div>

      {teams.map((savedTeam, index) => (
        <div key={index} className='flex flex-col gap-2 border border-slate-400 bg-slate-100 dark:bg-slate-900 p-2 md:p-6 rounded-md'>
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

          <div className='flex flex-wrap items-center justify-center gap-3'>
            {!teams.length ? (
              <div className='flex flex-col gap-6'>
                <p className='text-sm text-slate-500'>{t('teamBuilder.noSavedTeams')}</p>
              </div>
            ) : (
              savedTeam.members.map((member, index) => (
                <MemberCard key={index} data={member} />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({ data, onClick }: { data: PokemonListItem, onClick?: () => void }) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;

    target.src = '/missingno.png';
  };

  return (
    <div onClick={onClick} className='cursor-pointer border border-slate-400 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 shadow-md rounded-lg p-3 md:p-6 min-w-30 min-h-30 md:min-w-min md:min-h-min lg:min-w-55 max-w-55 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1'>
      <Image
        src={`https://assets.pokemon.com/assets/cms2/img/pokedex/detail/` + getPokemonIdFromUrl(data.url).toString().padStart(3, '0') + '.png'}
        alt={data.name}
        width={100}
        height={100}
        className='w-20 h-20 sm:w-35 sm:h-35 md:w-30 md:h-30 mx-auto'
        data-retry-count="0"
        onError={handleImageError}
      />

      <h3 className='text-center text-xs sm:text-sm md:text-2xl font-semibold capitalize text-primary break-words'>{data.name}</h3>
    </div>
  );

}
