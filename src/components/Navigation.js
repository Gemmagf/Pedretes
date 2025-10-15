import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Settings, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <motion.aside 
      className="fixed left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-50"
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8">
        <motion.div 
          className="flex items-center gap-3 mb-12"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">💎</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Els Diamants</h1>
        </motion.div>

        <nav className="space-y-2">
          <motion.div 
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 font-medium w-full">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
          </motion.div>

          <motion.div 
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/alliance" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Alliance</span>
            </Link>
          </motion.div>

          <motion.div 
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/fassung" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors">
              <Settings className="w-5 h-5" />
              <span>Fassung</span>
            </Link>
          </motion.div>

          <motion.div 
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link to="/pave" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Pavé</span>
            </Link>
          </motion.div>
        </nav>
      </div>
    </motion.aside>
  );
};

export default Navigation;