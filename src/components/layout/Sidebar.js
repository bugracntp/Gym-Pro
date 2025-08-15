import React from 'react';
import { 
  Home, 
  Users, 
  CreditCard, 
  Activity, 
  Settings, 
  LogOut,
  Calendar,
  Dumbbell,
  BarChart3,
  FileText
} from 'lucide-react';
import logo from '../../assets/logo.jpg';
import { PAGES } from '../../constants/app';

const Sidebar = ({ currentPage, onPageChange, isCollapsed = false }) => {
  // Navigation items
  const navigationItems = [
    {
      id: PAGES.DASHBOARD,
      label: 'Dashboard',
      icon: Home,
      description: 'Genel bakış ve istatistikler'
    },
    {
      id: PAGES.CUSTOMERS,
      label: 'Müşteriler',
      icon: Users,
      description: 'Müşteri yönetimi'
    },
    {
      id: PAGES.MEMBERSHIPS,
      label: 'Üyelikler',
      icon: LogOut,
      description: 'Üyelik işlemleri'
    },
    {
      id: PAGES.MEMBERSHIP_TYPES,
      label: 'Üyelik Tipleri',
      icon: BarChart3,
      description: 'Üyelik paketleri ve fiyatları'
    },
    {
      id: PAGES.PAYMENTS,
      label: 'Ödemeler',
      icon: CreditCard,
      description: 'Ödeme işlemleri'
    },
    {
      id: PAGES.EXERCISES,
      label: 'Egzersizler',
      icon: Activity,
      description: 'Egzersiz kütüphanesi'
    },
    {
      id: PAGES.MEMBER_PROGRAMS,
      label: 'Üye Programları',
      icon: Dumbbell,
      description: 'Kişisel antrenman planları'
    },
    {
      id: PAGES.ENTRIES,
      label: 'Girişler',
      icon: FileText,
      description: 'Salon giriş kayıtları'
    },
    {
      id: PAGES.SETTINGS,
      label: 'Ayarlar',
      icon: Settings,
      description: 'Sistem ayarları'
    }
  ];

  // Navigation item render
  const renderNavItem = (item) => {
    const IconComponent = item.icon;
    const isActive = currentPage === item.id;
    
    return (
      <li key={item.id}>
        <button
          onClick={() => onPageChange(item.id)}
          className={`
            w-full flex items-center px-4 py-3
            text-left transition-all duration-200
            rounded-lg group
            ${isActive 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
        >
          {/* Icon */}
          <IconComponent 
            size={20} 
            className={`
              flex-shrink-0 transition-colors duration-200
              ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
            `}
          />
          
          {/* Label and Description */}
          {!isCollapsed && (
            <div className="ml-3 flex-1">
              <div className="font-medium">{item.label}</div>
              <div className={`
                text-xs transition-colors duration-200
                ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-600'}
              `}>
                {item.description}
              </div>
            </div>
          )}
        </button>
      </li>
    );
  };

  return (
    <aside className={`
      bg-white border-r border-gray-200
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
              <Dumbbell size={20} className="text-white" />
            </div>
            <span className="ml-3 text-lg font-bold text-gray-900">
              GYM Pro
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center overflow-hidden shadow-md">
              <Dumbbell size={20} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map(renderNavItem)}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            v1.0.0 • GYM Pro
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar; 