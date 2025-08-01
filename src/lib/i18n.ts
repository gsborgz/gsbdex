import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      searchByNamePlaceholder: 'Pesquisar Pokémon por nome...',
      errorLoadingPokemon: 'Erro ao carregar os dados do Pokémon: {{ message }}',
      unknownError: 'Erro desconhecido',
      teamBuilder: 'Construtor de Equipe',
      type: {
        normal: 'Normal',
        fire: 'Fogo',
        water: 'Água',
        grass: 'Planta',
        electric: 'Elétrico',
        ice: 'Gelo',
        fighting: 'Lutador',
        poison: 'Venenoso',
        ground: 'Terrestre',
        flying: 'Voador',
        psychic: 'Psíquico',
        bug: 'Inseto',
        rock: 'Pedra',
        ghost: 'Fantasma',
        dragon: 'Dragão',
        dark: 'Sombrio',
        steel: 'Aço',
        fairy: 'Fada',
      }
    },
  },
  en: {
    translation: {
      searchByNamePlaceholder: 'Search Pokémon by name...',
      errorLoadingPokemon: 'Error loading Pokémon data: {{ message }}',
      unknownError: 'Unknown error',
      teamBuilder: 'Team Builder',
      type: {
        normal: 'Normal',
        fire: 'Fire',
        water: 'Water',
        grass: 'Grass',
        electric: 'Electric',
        ice: 'Ice',
        fighting: 'Fighting',
        poison: 'Poison',
        ground: 'Ground',
        flying: 'Flying',
        psychic: 'Psychic',
        bug: 'Bug',
        rock: 'Rock',
        ghost: 'Ghost',
        dragon: 'Dragon',
        dark: 'Dark',
        steel: 'Steel',
        fairy: 'Fairy',
      }
    },
  },
};

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'pt';
  }

  return 'pt';
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: 'pt',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
