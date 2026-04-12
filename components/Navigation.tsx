import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Handshake, Settings, Gem, Users, Menu, X, BarChart2, LogOut } from 'lucide-react';

const Navigation = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/analytics', icon: BarChart2, label: t('analytics') },
    { path: '/alliance', icon: Handshake, label: t('allianceFormTitle') },
    { path: '/fassung', icon: Settings, label: t('fassungFormTitle') },
    { path: '/pave', icon: Gem, label: t('paveFormTitle') },
    { path: '/users', icon: Users, label: t('userManagement') },
  ];

  const NavContent = () => (
    <>
      <div className="mb-8 px-4 flex items-center justify-center">
        <h1 className="text-2xl font-serif font-bold text-amber-600 tracking-wider">PEDRETES</h1>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {links.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 mx-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-amber-100 text-amber-800 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* User info + logout */}
      <div className="mx-2 mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-amber-50/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jewelry-copper to-jewelry-bronze flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-700 truncate">{user?.name || user?.email}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Abmelden"
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(v => !v)} className="p-2 bg-white rounded-lg shadow-md border border-gray-200">
          {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
        </button>
      </div>

      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex-col py-6 z-40">
        <NavContent />
      </nav>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <nav className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl py-6 flex flex-col">
            <NavContent />
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;
