import React from "react";
import { Favorites, Container } from "../components/index";

const FavoritesPage = () => {
  // Fetch favorites from the backend or Redux store
  const favorites = []; // Replace with actual data

  return (
    <Container>
      <Favorites favorites={favorites} />
    </Container>
  );
};

export default FavoritesPage;