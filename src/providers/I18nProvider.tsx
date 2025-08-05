'use client'

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { getStoredLanguage } from '@lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Carregar idioma armazenado após a hidratação
    const storedLanguage = getStoredLanguage();
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  // Durante a hidratação, garantir que o conteúdo seja consistente
  if (!isClient) {
    return (
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    );
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}
