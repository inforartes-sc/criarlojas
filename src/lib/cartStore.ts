export interface CartItem {
  id: string; // unique cart item id (product.id + variation string)
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variations?: { [key: string]: string };
  storeId: string;
  sku?: string;
}

export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem('loja_cart');
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
};

export const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('loja_cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const addToCart = (item: Omit<CartItem, 'id'>) => {
  const cart = getCart();
  const variationKey = item.variations ? JSON.stringify(item.variations) : '';
  const itemId = `${item.productId}_${variationKey}`;

  const existingIndex = cart.findIndex(i => i.id === itemId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push({ ...item, id: itemId });
  }

  saveCart(cart);
  window.dispatchEvent(new CustomEvent('cartOpened')); // Open cart drawer automatically when adding!
};

export const removeFromCart = (id: string) => {
  const cart = getCart();
  const updated = cart.filter(i => i.id !== id);
  saveCart(updated);
};

export const updateQuantity = (id: string, quantity: number) => {
  const cart = getCart();
  const index = cart.findIndex(i => i.id === id);
  if (index > -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = quantity;
    }
    saveCart(cart);
  }
};

export const clearCart = () => {
  saveCart([]);
};
