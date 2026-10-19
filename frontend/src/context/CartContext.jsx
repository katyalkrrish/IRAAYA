import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) { setCart({ items: [], total: 0 }); return; }
    try {
      const res = await api.get('/api/cart');
      setCart(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    setLoading(true);
    try {
      await api.post('/api/cart/add', { productId, quantity });
      await fetchCart();
      toast.success('Added to cart!');
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCart = async (productId, quantity) => {
    setLoading(true);
    try {
      await api.put('/api/cart/update', { productId, quantity });
      await fetchCart();
    } catch (e) {
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      await api.delete(`/api/cart/remove/${productId}`);
      await fetchCart();
      toast.success('Removed from cart');
    } catch (e) {
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart/clear');
      setCart({ items: [], total: 0 });
    } catch (e) {
      console.error(e);
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCart, removeFromCart, clearCart, fetchCart, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
