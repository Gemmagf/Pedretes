import React, { useState } from 'react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import { motion } from 'framer-motion';  
import { Settings, Home, LayoutDashboard } from 'lucide-react';  
import Navigation from './components/Navigation';  
import Dashboard from './components/Dashboard';  
import FormAlliance from './components/FormAlliance';  
import FormFassung from './components/FormFassung';  
import FormPave from './components/FormPave';  
  
const App = () => {  
  const [showSettings, setShowSettings] = useState(false);  
  
  return (  
    <Router>  
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">  
        <Navigation />  
  
        <main className="ml-64 p-4 sm:p-8">  
          <header className="flex justify-between items-center mb-6 sm:mb-8">  
            <motion.div  
              className="flex items-center gap-3"  
              initial={{ opacity: 0, x: -20 }}  
              animate={{ opacity: 1, x: 0 }}  
              transition={{ duration: 0.5 }}  
            >  
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center">  
                <LayoutDashboard className="w-5 h-5 text-white" />  
              </div>  
              <h1 className="text-2xl sm:text-4xl font-serif font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">  
                Els Diamants de la Sareta - Prototipo  
              </h1>  
            </motion.div>  
  
            <motion.button  
              onClick={() => setShowSettings(!showSettings)}  
              className="p-2 sm:p-3 bg-white rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300"  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.95 }}  
              initial={{ opacity: 0, x: 20 }}  
              animate={{ opacity: 1, x: 0 }}  
              transition={{ duration: 0.5, delay: 0.2 }}  
            >  
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />  
            </motion.button>  
          </header>  
  
          <Routes>  
            <Route path="/" element={  
              <motion.div  
                initial={{ opacity: 0 }}  
                animate={{ opacity: 1 }}  
                transition={{ duration: 0.5 }}  
              >  
                <Dashboard />  
              </motion.div>  
            } />  
            <Route path="/alliance" element={  
              <motion.div  
                initial={{ opacity: 0, x: 20 }}  
                animate={{ opacity: 1, x: 0 }}  
                transition={{ duration: 0.5 }}  
              >  
                <FormAlliance />  
              </motion.div>  
            } />  
            <Route path="/fassung" element={  
              <motion.div  
                initial={{ opacity: 0, x: 20 }}  
                animate={{ opacity: 1, x: 0 }}  
                transition={{ duration: 0.5 }}  
              >  
                <FormFassung />  
              </motion.div>  
            } />  
            <Route path="/pave" element={  
              <motion.div  
                initial={{ opacity: 0, x: 20 }}  
                animate={{ opacity: 1, x: 0 }}  
                transition={{ duration: 0.5 }}  
              >  
                <FormPave />  
              </motion.div>  
            } />  
          </Routes>  
        </main>  
  
        {/* Panel de Configuraciones - Siempre Funcional */}  
        {showSettings && (  
          <motion.div  
            className="fixed top-4 right-4 bg-white rounded-xl p-4 sm:p-6 shadow-2xl border border-gray-200 w-64 sm:w-80 z-50 max-h-96 overflow-y-auto"  
            initial={{ opacity: 0, scale: 0.9, x: 20 }}  
            animate={{ opacity: 1, scale: 1, x: 0 }}  
            exit={{ opacity: 0, scale: 0.9, x: 20 }}  
            transition={{ duration: 0.3 }}  
          >  
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">  
              <Settings className="w-5 h-5" /> Configuraciones del Prototipo  
            </h3>  
            <ul className="space-y-3 text-sm">  
              <li className="hover:bg-gray-50 p-2 rounded-lg"><span className="text-gray-600 cursor-pointer hover:text-amber-600">Editar título del proyecto</span></li>  
              <li className="hover:bg-gray-50 p-2 rounded-lg"><span className="text-gray-600 cursor-pointer hover:text-amber-600">Ver código fuente completo</span></li>  
              <li className="hover:bg-gray-50 p-2 rounded-lg"><span className="text-gray-600 cursor-pointer hover:text-amber-600">Reportar un error o idea</span></li>  
              <li className="hover:bg-gray-50 p-2 rounded-lg"><span className="text-gray-600 cursor-pointer hover:text-amber-600">Transferir a otro usuario</span></li>  
              <li className="hover:bg-gray-50 p-2 rounded-lg"><span className="text-gray-600 cursor-pointer hover:text-amber-600">Descargar código en ZIP</span></li>  
              <li className="hover:bg-gray-50 p-2 rounded-lg text-red-600 cursor-pointer hover:text-red-700"><span>Eliminar proyecto entero</span></li>  
            </ul>  
            <motion.button  
              onClick={() => setShowSettings(false)}  
              className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"  
              whileHover={{ scale: 1.02 }}  
            >  
              Cerrar  
            </motion.button>  
          </motion.div>  
        )}  
      </div>  
    </Router>  
  );  
};  
  
export default App;