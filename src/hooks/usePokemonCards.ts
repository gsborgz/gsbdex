import TCGdex, { Query } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

type AppSupportedLanguage = 'en' | 'fr' | 'pt';

const SUPPORTED_LANGUAGES: AppSupportedLanguage[] = ['en', 'fr', 'pt'];

const POCKET_SERIE_ID = 'tcgp';

const POKEMON_CATEGORY_BY_LANGUAGE: Record<AppSupportedLanguage, string> = {
  en: 'Pokemon',
  fr: 'Pokémon',
  pt: 'Pokémon',
};

let pocketSetIdsPromise: Promise<string[]> | null = null;

const cardsCache = new Map<string, ReturnType<typeof fetchPokemonCards>>();

export function usePokemonCards(name: string, language?: string, page = 1, itemsPerPage = 8) {
  const supportedLanguage = toSupportedLanguage(language);
  const cacheKey = `${supportedLanguage}|${name.toLowerCase()}|${page}|${itemsPerPage}`;
  const cached = cardsCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const request = fetchPokemonCards(name, supportedLanguage, page, itemsPerPage).catch((err) => {
    cardsCache.delete(cacheKey);

    throw err;
  });

  cardsCache.set(cacheKey, request);

  return request;
};

async function fetchPokemonCards(name: string, supportedLanguage: AppSupportedLanguage, page: number, itemsPerPage: number) {
  tcgdex.setLang(supportedLanguage);

  const pocketSetIds = await getPocketSetIds();
  const query = Query.create()
    .contains('name', capitalize(name))
    .equal('category', POKEMON_CATEGORY_BY_LANGUAGE[supportedLanguage])
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

function toSupportedLanguage(language?: string): AppSupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as AppSupportedLanguage)
    ? (language as AppSupportedLanguage)
    : 'en';
}

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
