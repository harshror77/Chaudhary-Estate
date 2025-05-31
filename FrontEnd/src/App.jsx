import { useEffect, useState } from 'react';
import axios from 'axios';
import { login, logout } from './store/authSlice.js'
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
    axios.get('http://localhost:3000/users/getCurrentUser', { withCredentials: true })
      .then((userData) => {
        console.log("app: ",userData)
        if (userData.data.data) {
          dispatch(login(userData.data.data));
          connectSocket(userData.data.data._id);
        }
        else {
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {location.pathname !== '/chat' ? (<Header />) : (<Outlet />)}
    </div>
  );
}

export default App;
