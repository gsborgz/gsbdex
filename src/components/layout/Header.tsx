'use client'

import ThemeToggle from '@components/ThemeToggle';
import { LanguageToggle } from '@components/LanguageToggle';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';
import { BookAlert, Copy, CopyCheck, ClipboardPaste } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCollection } from '@providers/CollectionProvider';

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentRoute = usePathname();
  const isPokedex = currentRoute === '/';
  const { getExportCode, importFromCode } = useCollection();
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
      <div className='flex md:hidden items-center justify-start gap-2 px-4 py-3'>
        <Button variant="default" primary={isPokedex} onClick={() => router.push('/')} className='flex items-center'>
          <BookAlert className='w-6 h-6' />
        </Button>
      </div>

      <div className='hidden md:flex items-center justify-start gap-2 px-4 py-3'>
        <Link className="flex items-center space-x-2" href="/">
          <span className={`hidden font-bold sm:inline-block ${isPokedex ? 'link-primary' : 'link-secondary'}`}>
            Pokédex
          </span>
        </Link>
      </div>

      <div className='flex items-center justify-end gap-2 px-4 py-3'>
        <Button variant='ghost' size='icon' onClick={handleCopyCode} title={t('collection.copyCode')}>
          {copied ? <CopyCheck className='w-5 h-5' /> : <Copy className='w-5 h-5' />}
        </Button>

        <Button variant='ghost' size='icon' onClick={handleImportCode} title={t('collection.pasteCode')}>
          <ClipboardPaste className='w-5 h-5' />
        </Button>

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
