import React from "react";
import { SearchResults, Container } from "../components/index";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");

  // Fetch search results from the backend based on the query
  const results = []; // Replace with actual data

  return (
    <Container>
      <SearchResults results={results} />
    </Container>
  );
};

export default SearchResultsPage;