import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Rooms', href: '/rooms', icon: '🏢' },
    { name: 'Bookings', href: '/bookings', icon: '📅' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0">
      <div className="p-4">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">SM</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">Rooma</span>
        </div>
        
        <nav className="space-y-2">
          {navigation.map(item => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === item.href
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
