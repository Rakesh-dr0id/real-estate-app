import React from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
            src="https://static.rdc.moveaws.com/images/logos/rdc-logo-default.svg"
            alt="logo"
            className="h-5 cursor-pointer"
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
              to={'/sign-in'}
              className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${
                pathMatchRoute('/sign-in') && 'text-black border-b-red-500'
              }`}
            >
              Sign In
            </NavLink>
          </ul>
        </div>
      </header>
    </div>
  );
};

export default Header;
