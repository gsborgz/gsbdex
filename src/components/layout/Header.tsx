'use client'

import ThemeToggle from '@components/ThemeToggle';
import { LanguageToggle } from '@components/LanguageToggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Button } from '@components/ui/Button';
import { Blocks, BookAlert } from 'lucide-react';

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentRoute = usePathname();
  const isPokedex = currentRoute === '/';
  const isTeamBuilder = currentRoute === '/team-builder';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <HeaderBar>
      <div className='flex md:hidden items-center justify-start gap-2 px-4 py-3'>
        <Button variant="default" primary={isPokedex} onClick={() => router.push('/')} className='flex items-center'>
          <BookAlert className='w-6 h-6' />
        </Button>

        <Button variant="default" primary={isTeamBuilder} onClick={() => router.push('/team-builder')}>
          <Blocks className='w-6 h-6' />
        </Button>
      </div>

      <div className='hidden md:flex items-center justify-start gap-2 px-4 py-3'>
        <Link className="flex items-center space-x-2" href="/">
          <span className={`hidden font-bold sm:inline-block ${isPokedex ? 'link-primary' : 'link-secondary'}`}>
            Pokédex
          </span>
        </Link>

        <Link className="flex items-center space-x-2" href="/team-builder">
          <span className={`hidden font-bold sm:inline-block ${isTeamBuilder ? 'link-primary' : 'link-secondary'}`}>
            {mounted ? t('teamBuilder.title') : 'Team Builder'}
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
