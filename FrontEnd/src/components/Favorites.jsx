import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Heart, MapPin, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '../components/index';
import { useSelector } from 'react-redux';

const Favorites = () => {
  const user = useSelector(state => state.auth.userData);
console.log('User from Redux:', user); 
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/favorite/${user?._id}`, {
          withCredentials: true,
        });
        //console.log(response)
        //console.log('Favorites:', favorites);
        setFavorites(response.data.data);
      } catch (err) {
        setError('Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchFavorites();
    else setLoading(false);
  }, [user]);

  const handleRemoveFavorite = async (propertyId) => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/favorite/${propertyId}`, {}, { withCredentials: true });
      setFavorites(prev => prev.filter(fav => fav.property._id !== propertyId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-500 text-xl mt-12">{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Your Favorite Properties
        </h1>

        <AnimatePresence>
          {favorites.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-gray-600 text-xl mt-12"
            >
              No favorites added yet. Start exploring properties!
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav, index) => (
                <motion.div
                  key={fav._id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveFavorite(fav.property._id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-red-100 rounded-full shadow-sm"
                  >
                    <X size={20} className="text-red-600" />
                  </motion.button>

                  {/* Property Image */}
                  <Link to={`/property/${fav.property._id}`} className="block">
                    <div className="h-48 overflow-hidden rounded-t-2xl">
                      <img
                        src={fav.property.images?.[0] || '/default-property.jpg'}
                        alt={fav.property.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 truncate">
                        {fav.property.title}
                      </h2>
                      <Heart
                        size={20}
                        className="text-red-500 fill-current"
                      />
                    </div>

                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      ₹{fav.property.price?.toLocaleString()}
                    </p>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin size={16} className="mr-1" />
                      <span className="truncate">{fav.property.address}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="capitalize">{fav.property.propertyType}</span>
                      <span>{new Date(fav.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};

export default Favorites;