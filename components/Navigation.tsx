import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';
import { LayoutDashboard, Handshake, Settings, Gem, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    { path: '/alliance', icon: Handshake, label: t('allianceFormTitle') },
    { path: '/fassung', icon: Settings, label: t('fassungFormTitle') },
    { path: '/pave', icon: Gem, label: t('paveFormTitle') },
    { path: '/users', icon: Users, label: t('userManagement') },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const NavContent = () => (
    <>
      <div className="mb-8 px-4 flex items-center justify-center">
        <h1 className="text-2xl font-serif font-bold text-amber-600 tracking-wider">PEDRETES</h1>
      </div>
      <div className="flex flex-col gap-2">
        {links.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 mx-2 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-amber-100 text-amber-800 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleMenu} className="p-2 bg-white rounded-lg shadow-md border border-gray-200">
          {isOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm flex-col py-6 z-40">
        <NavContent />
      </nav>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleMenu}></div>
          <nav className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl py-6 flex flex-col animate-slide-in">
            <NavContent />
          </nav>
        </div>
      )}
    </>
  );
};

export default Navigation;