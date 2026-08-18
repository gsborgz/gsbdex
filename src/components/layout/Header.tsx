'use client'

import ThemeToggle from '@components/ThemeToggle';
import { LanguageToggle } from '@components/LanguageToggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { BookAlert, Copy, CopyCheck, ClipboardPaste, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCollection } from '@providers/CollectionProvider';
import { useSearch } from '@providers/SearchProvider';
import Input from '@components/ui/Input';

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentRoute = usePathname();
  const isPokedex = currentRoute === '/';
  const { getExportCode, importFromCode } = useCollection();
  const { searchTerm, setSearchTerm } = useSearch();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      const code = await getExportCode();

      await navigator.clipboard.writeText(code);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(t('collection.copyCodeError'));
    }
  };

  const handleImportCode = async () => {
    const code = window.prompt(t('collection.pasteCodePrompt'));

    if (!code) return;

    try {
      await importFromCode(code.trim());
      alert(t('collection.importSuccess'));
    } catch {
      alert(t('collection.invalidCode'));
    }
  };

  return (
    <HeaderBar>
      <div className='flex items-center justify-between gap-2 px-4 py-3'>
        <div className='flex md:hidden items-center gap-2'>
          <Button variant="default" primary={isPokedex} onClick={() => router.push('/')} className='flex items-center'>
            <BookAlert className='w-6 h-6' />
          </Button>
        </div>

        <div className='hidden md:flex items-center gap-2'>
          <Link className="flex items-center space-x-2" href="/">
            <span className={`hidden font-bold sm:inline-block ${isPokedex ? 'link-primary' : 'link-secondary'}`}>
              Pokédex
            </span>
          </Link>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder={t('searchByNamePlaceholder')}
          className='hidden md:block flex-1 max-w-md mx-4'
        />

        <div className='flex items-center justify-end gap-2'>
          <Button variant='ghost' size='icon' onClick={handleCopyCode} title={t('collection.copyCode')}>
            {copied ? <CopyCheck className='w-5 h-5' /> : <Copy className='w-5 h-5' />}
          </Button>

          <Button variant='ghost' size='icon' onClick={handleImportCode} title={t('collection.pasteCode')}>
            <ClipboardPaste className='w-5 h-5' />
          </Button>

          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t('searchByNamePlaceholder')}
        className='md:hidden px-4 pb-3'
      />
    </HeaderBar>
  );
}

function SearchBar({ value, onChange, placeholder, className }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4' />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className='pl-10 text-xs md:text-sm'
        />
      </div>
    </div>
  );
}

function HeaderBar({ children }: { children: React.ReactNode }) {
  return (
    <header className='sticky flex flex-col top-0 z-50 w-full !p-0 border-b backdrop-blur border-slate-400'>
      {children}
    </header>
  );
}
