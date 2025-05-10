import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoginPage from './pages/Login.jsx'
import SignupPage from './pages/SignUp.jsx';
import ProfilePage from './pages/Profile.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import PropertyDetailsPage from './pages/PropertyDetails.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PropertyPage from './pages/AddProperty.jsx';

import EditProfile from './pages/EditProfile.jsx';
import { Provider } from 'react-redux';
import store from './store/store.js';
import ChatPage from './pages/ChatPage.jsx';


import { persistor } from './store/store.js';
import { PersistGate } from "redux-persist/integration/react";
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthCheck from './components/AuthCheck.jsx'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <AuthCheck /> 
      },
      {
        path: '/login',
        element: <LoginPage />
      },
      {
        path: '/signup',
        element: <SignupPage />
      },
      {
        path: '/dashboard',
        element: <DashboardPage />
      },
      {
        element: <ProtectedRoute />, // Protected routes
        children: [
          {
            path: '/profile',
            element: <ProfilePage />
          },
          {
            path: '/add-properties',
            element: <PropertyPage />
          },
          {
            path: '/favorites',
            element: <FavoritesPage />
          },
          {
            path: '/chat',
            element: <ChatPage />
          },
          {
            path: '/notifications',
            element: <NotificationsPage />
          },
          {
            path: '/settings',
            element: <SettingsPage />
          },
          {
            path: '/editProfile',
            element: <EditProfile />
          }
        ],
      },
      {
        path: '/search',
        element: <SearchResultsPage />
      },
      {
        path: '/property/:id',
        element: <PropertyDetailsPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)