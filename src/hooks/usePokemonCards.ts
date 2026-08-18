import TCGdex, { Query } from '@tcgdex/sdk';

const tcgdex = new TCGdex('en');

export function usePokemonCards(name: string) {
  return tcgdex.card.list(
    Query.create()
      .equal('name', capitalize(name))
      .sort('localId', 'ASC')
  );
};

function capitalize(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
