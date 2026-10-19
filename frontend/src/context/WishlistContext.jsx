import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    if (!user) { setWishlist([]); return; }
    try {
      const res = await api.get('/api/wishlist');
      setWishlist(res.data.items.map(i => i.id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      const res = await api.post('/api/wishlist/toggle', { productId });
      if (res.data.inWishlist) {
        setWishlist(prev => [...prev, productId]);
        toast.success('Added to wishlist ❤️');
      } else {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (e) {
      toast.error('Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
