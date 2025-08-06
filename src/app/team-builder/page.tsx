'use client'

import { useState } from 'react';

export default function TeamBuilder() {
  const [activeTab, setActiveTab] = useState<'builder' | 'my-teams'>('builder');

  return (
    <section>
      <div className='grid gap-2 grid-cols-2 bg-slate-600 p-1 rounded-md'>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'builder' ? 'bg-slate-900' : ''}`} onClick={() => setActiveTab('builder')}>Construtor</p>
        <p className={`text-sm font-bold flex items-center justify-center rounded-md p-2 cursor-pointer ${activeTab === 'my-teams' ? 'bg-slate-900' : ''}`} onClick={() => setActiveTab('my-teams')}>Meus Times</p>
      </div>

      {activeTab === 'builder' ? (
        <Builder />
      ) : (
        <MyTeams />
      )}
    </section>
  );
}

function Builder() {
  return (
    <div>
      {/* Implementar a lógica do construtor de times aqui */}
      <p>Construtor de times em desenvolvimento...</p>
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
