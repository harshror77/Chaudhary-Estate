import React from "react";
import { Notifications, Container } from "../components/index";

const NotificationsPage = () => {
  // Fetch notifications from the backend or Redux store
  const notifications = []; // Replace with actual data

  return (
    <Container>
      <Notifications notifications={notifications} />
    </Container>
  );
};

export default NotificationsPage;