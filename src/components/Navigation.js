import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../context/LanguageContext';
import { Home, Layers, Package, Grid } from 'lucide-react';

const Navigation = () => {
  const { t } = useTranslation();

  const links = [
    { path: '/', icon: Home, label: t('dashboard') },
    { path: '/alliance', icon: Layers, label: t('allianceFormTitle') },
    { path: '/fassung', icon: Package, label: t('fassungFormTitle') },
    { path: '/pave', icon: Grid, label: t('paveFormTitle') },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 shadow-lg p-4 flex flex-col gap-6">
      {links.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-xl hover:bg-amber-100 transition ${
              isActive ? 'bg-amber-200 font-bold' : ''
            }`
          }
        >
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
