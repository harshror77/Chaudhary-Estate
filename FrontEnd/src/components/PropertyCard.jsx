import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const PropertyCard = ({ property }) => {
  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={{ scale: 1.05 }}
    >
      <img
        src={property.images[0]}
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold">{property.title}</h3>
        <p className="text-gray-600">{property.description}</p>
        <p className="text-lg font-bold mt-2">₹{property.price}</p>
        <Link
          to={`/property/${property._id}`}
          className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

export default PropertyCard;