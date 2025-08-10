import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Rooms', href: '/rooms' },
    { name: 'Bookings', href: '/bookings' },
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <nav className="bg-white shadow px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="text-indigo-600 font-bold text-xl">Rooma</div>
        <div className="hidden md:flex space-x-4">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === item.href
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      <div>
        {/* Placeholder for user profile or actions */}
      </div>
    </nav>
  );
};

export default Navbar;
