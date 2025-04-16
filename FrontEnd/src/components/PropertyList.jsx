import React from "react";
import PropertyCard from "./PropertyCard";
import { motion } from "framer-motion";

const PropertyList = ({ properties }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <motion.div
          key={property._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PropertyCard property={property} />
        </motion.div>
      ))}
    </div>
  );
};

export default PropertyList;