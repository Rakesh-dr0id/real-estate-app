import React, { useState, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../assets/rakesh-real-estate.png';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Header = () => {
  const [pageState, setPageState] = useState('Sign in');
  const location = useLocation();
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState('Profile');
      } else {
        setPageState('Sign in');
      }
    });
  }, [auth]);

  function pathMatchRoute(route) {
    if (route === location.pathname) {
      return true;
    }
  }

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img
            src={Logo}
            alt="logo"
            className="h-6 cursor-pointer"
            onClick={() => {
              navigate('/');
            }}
          />
        </div>

        <div>
          <ul className="flex space-x-10">
            <NavLink
              to={'/'}
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute('/') && 'text-black border-b-red-500'
              }`}
            >
              Home
            </NavLink>

            <NavLink
              to={'/offers'}
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute('/offers') && 'text-black border-b-red-500'
              }`}
            >
              Offers
            </NavLink>

            <NavLink
              to={'/profile'}
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute('/sign-in') ||
                (pathMatchRoute('/profile') && 'text-black border-b-red-500')
              }`}
            >
              {pageState}
            </NavLink>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Header;
