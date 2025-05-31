import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Loader from '../pages/Loader.jsx';

const FilterProperty = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const locationHook = useLocation();


    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const searchParams = new URLSearchParams(locationHook.search);
                const locationParam = searchParams.get('location');
                const priceFrom = searchParams.get('priceFrom');
                const priceTo = searchParams.get('priceTo');
                const statusFilter = searchParams.get('status');
    
                const query = {
                    location: locationParam,
                    priceFrom,
                    priceTo,
                    status: statusFilter,
                };
                console.log(query)
    
                const response = await axios.get("http://localhost:3000/property/filterProperty", {
                    params: query,
                    withCredentials: true,
                });
    
                setProperties(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching properties:', error);
                setLoading(false);
            }
        };
        fetchProperties();
    }, [locationHook.search]);
    





    const handlePropertyClick = (propertyId) => {
        navigate(`/property/${propertyId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Found Properties ...</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {properties.map((property) => (
                        <motion.div
                            key={property._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className={`bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer ${property.status === 'sold' ? 'opacity-70 bg-gray-100' : ''}`}
                        >
                            <div className="relative h-48">
                                <img
                                    src={property.images[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target.src = '/placeholder-property.jpg')}
                                />
                            </div>

                            <div className="p-4">
                                <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">
                                    {property.title}
                                </h2>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-600 flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        {property.location?.address ||
                                            `${property.location?.street || ''}, ${property.location?.city || ''}, ${property.location?.state || ''}`}
                                    </p>

                                    <p className="text-lg font-semibold text-blue-600">
                                        ₹{new Intl.NumberFormat().format(property.price)}
                                    </p>

                                    <div
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${property.status === 'sold'
                                                ? 'bg-red-100 text-red-800'
                                                : property.status === 'rented'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {property.status?.toUpperCase()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handlePropertyClick(property._id)}
                                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                                >
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FilterProperty;