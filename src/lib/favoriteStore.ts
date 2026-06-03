export interface FavoriteItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  storeId: string;
}

export const getFavorites = (): FavoriteItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem('loja_favorites');
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

export const saveFavorites = (favs: FavoriteItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('loja_favorites', JSON.stringify(favs));
  window.dispatchEvent(new Event('favoritesUpdated'));
};

export const toggleFavorite = (item: FavoriteItem): boolean => {
  const favs = getFavorites();
  const existingIndex = favs.findIndex(i => i.productId === item.productId);
  let isAdded = false;

  if (existingIndex > -1) {
    favs.splice(existingIndex, 1);
    isAdded = false;
  } else {
    favs.push(item);
    isAdded = true;
  }

  saveFavorites(favs);
  return isAdded;
};

export const isFavorited = (productId: string): boolean => {
  const favs = getFavorites();
  return favs.some(i => i.productId === productId);
};
