import { unstable_cache } from 'next/cache';
import { getIngredients, getRecipes, getWasteEntries } from './data-db';

// Cache for 30 seconds
export const getCachedIngredients = unstable_cache(
  async () => getIngredients(),
  ['ingredients'],
  { revalidate: 30, tags: ['ingredients'] }
);

export const getCachedRecipes = unstable_cache(
  async () => getRecipes(),
  ['recipes'],
  { revalidate: 30, tags: ['recipes'] }
);

export const getCachedWasteEntries = unstable_cache(
  async () => getWasteEntries(),
  ['waste'],
  { revalidate: 30, tags: ['waste'] }
);