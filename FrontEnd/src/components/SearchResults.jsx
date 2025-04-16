import React from "react";
import PropertyList from "./PropertyList";
import { motion } from "framer-motion";

const SearchResults = ({ results }) => {
  return (
    <motion.div
      className="mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>
      {results.length > 0 ? (
        <PropertyList properties={results} />
      ) : (
        <p className="text-gray-600">No properties found.</p>
      )}
    </motion.div>
  );
};

export default SearchResults;