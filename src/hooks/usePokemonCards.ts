import TCGdex, { Query, type SupportedLanguages } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

const SUPPORTED_LANGUAGES: SupportedLanguages[] = ['en', 'fr', 'pt'];

export function usePokemonCards(name: string, language?: string, page = 1, itemsPerPage = 8) {
  tcgdex.setLang(toSupportedLanguage(language));

  return tcgdex.card.list(
    Query.create()
      .equal('name', capitalize(name))
      .sort('localId', 'ASC')
      .paginate(page, itemsPerPage)
  );
};

function toSupportedLanguage(language?: string): SupportedLanguages {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguages)
    ? (language as SupportedLanguages)
    : 'en';
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
