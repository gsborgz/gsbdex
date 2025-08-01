'use client'

import ThemeToggle from '@components/ThemeToggle';
import { LanguageToggle } from '@components/LanguageToggle';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const { t } = useTranslation();
  const currentRoute = usePathname();
  const isPokedex = currentRoute === '/';
  const isTeamBuilder = currentRoute === '/team-builder';

  return (
    <HeaderBar>
      <div className='flex items-center justify-start gap-2 px-4 py-3'>
        <Link className="flex items-center space-x-2" href="/">
          <span className={`hidden font-bold sm:inline-block ${isPokedex ? 'link-primary' : 'link-secondary'}`}>
            Pokédex
          </span>
        </Link>

        <Link className="flex items-center space-x-2" href="/team-builder">
          <span className={`hidden font-bold sm:inline-block ${isTeamBuilder ? 'link-primary' : 'link-secondary'}`}>
            {t('teamBuilder')}
          </span>
        </Link>
      </div>

      <div className='flex items-center justify-end gap-2 px-4 py-3'>
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </HeaderBar>
  );
}

function HeaderBar({ children }: { children: React.ReactNode }) {
  return (
    <header className='sticky flex items-center justify-between top-0 z-50 w-full !p-0 sm:px-4 border-b backdrop-blur border-slate-400'>
      {children}
    </header>
  );
}
