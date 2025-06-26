import { useEffect, useState } from 'react';
import axios from 'axios';
import { login, logout } from './store/authSlice.js';
import { Header } from './components/index.js';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from './pages/Loader.jsx';
import { connectSocket } from './lib/socket.js';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const status = useSelector(state => state.auth.status);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/users/getCurrentUser`, 
          { 
            withCredentials: true,
            cancelToken: source.token 
          }
        );

        if (response.data?.data) {
          dispatch(login(response.data.data));
          connectSocket(response.data.data._id);
        } else {
          dispatch(logout());
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Auth check error:", error);
          
          if (error.response?.status === 401) {
            dispatch(logout());
          }
        }
      } finally {
        if (!source.token.reason) {
          setLoading(false);
        }
      }
    };

    fetchCurrentUser();


    return () => {
      source.cancel("Component unmounted, request canceled");
    };
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {location.pathname !== '/chat' && <Header />}
      <Outlet />
    </div>
  );
}

export default App;
