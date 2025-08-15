import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import Button from '../ui/Button';

const Header = ({ 
  onSidebarToggle, 
  isSidebarCollapsed,
  currentUser,
  onLogout,
  onSearch,
  searchPlaceholder = "Ara..."
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  // User menu items
  const userMenuItems = [
    {
      label: 'Profil',
      icon: User,
      onClick: () => {
        setShowUserMenu(false);
        // Profile action
      }
    },
    {
      label: 'Ayarlar',
      icon: Settings,
      onClick: () => {
        setShowUserMenu(false);
        // Settings action
      }
    },
    {
      label: 'Çıkış Yap',
      icon: LogOut,
      onClick: () => {
        setShowUserMenu(false);
        onLogout();
      }
    }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Sidebar Toggle */}
          <button
            onClick={onSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Sidebar toggle"
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser?.name || 'Kullanıcı'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={item.onClick}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <item.icon size={16} className="text-gray-400" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 