import TCGdex, { Query, type SupportedLanguages } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

const SUPPORTED_LANGUAGES: SupportedLanguages[] = ['en', 'fr', 'pt'];

const POCKET_SERIE_ID = 'tcgp';

let pocketSetIdsPromise: Promise<string[]> | null = null;

export async function usePokemonCards(name: string, language?: string, page = 1, itemsPerPage = 8) {
  tcgdex.setLang(toSupportedLanguage(language));

  const pocketSetIds = await getPocketSetIds();
  const query = Query.create()
    .contains('name', capitalize(name))
    .sort('localId', 'ASC');

  pocketSetIds.forEach((setId) => query.not.contains('set.id', setId));

  return tcgdex.card.list(query.paginate(page, itemsPerPage));
};

export function matchesPokemonName(cardName: string, pokemonName: string): boolean {
  const escapedName = capitalize(pokemonName).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const boundary = '[^a-zA-Z]';

  return new RegExp(`(^|${boundary})${escapedName}(${boundary}|$)`, 'i').test(cardName);
}

function getPocketSetIds(): Promise<string[]> {
  if (!pocketSetIdsPromise) {
    pocketSetIdsPromise = tcgdex.serie.get(POCKET_SERIE_ID)
      .then((serie) => serie?.sets.map((set) => set.id) ?? [])
      .catch(() => []);
  }

  return pocketSetIdsPromise;
}

function toSupportedLanguage(language?: string): SupportedLanguages {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguages)
    ? (language as SupportedLanguages)
    : 'en';
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
