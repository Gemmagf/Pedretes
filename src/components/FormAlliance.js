import React, { useState } from 'react';  
import { motion } from 'framer-motion';  
import { Save, User, Calendar, Edit3 } from 'lucide-react';  
  
const FormAlliance = () => {  
  const [formData, setFormData] = useState({  
    projectName: '',  
    clientName: '',  
    description: '',  
    dueDate: ''  
  });  
  const [submitted, setSubmitted] = useState(false);  
  
  const handleChange = (e) => {  
    setFormData({ ...formData, [e.target.name]: e.target.value });  
  };  
  
  const handleSubmit = (e) => {  
    e.preventDefault();  
    if (formData.projectName && formData.clientName) {  
      setSubmitted(true);  
      // Simular guardado  
      setTimeout(() => setSubmitted(false), 3000);  
    }  
  };  
  
  return (  
    <motion.div  
      initial={{ opacity: 0, y: 20 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.5 }}  
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl"  
    >  
      <div className="flex items-center gap-3 mb-6">  
        <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">  
          <Edit3 className="w-6 h-6 text-white" />  
        </div>  
        <h2 className="text-2xl font-semibold text-gray-800">Nuevo Proyecto Alliance</h2>  
      </div>  
  
      <form onSubmit={handleSubmit} className="space-y-6">  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">  
            <User className="w-4 h-4" /> Nombre del Proyecto  
          </label>  
          <input  
            type="text"  
            name="projectName"  
            value={formData.projectName}  
            onChange={handleChange}  
            placeholder="Ej: Alianza Dorada"  
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"  
            required  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">  
            <User className="w-4 h-4" /> Nombre del Cliente  
          </label>  
          <input  
            type="text"  
            name="clientName"  
            value={formData.clientName}  
            onChange={handleChange}  
            placeholder="Ej: Joyería España S.A."  
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"  
            required  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">  
            <Edit3 className="w-4 h-4" /> Descripción  
          </label>  
          <textarea  
            name="description"  
            value={formData.description}  
            onChange={handleChange}  
            rows="3"  
            placeholder="Detalles del diseño de alianza..."  
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"  
          />  
        </div>  
  
        <div>  
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">  
            <Calendar className="w-4 h-4" /> Fecha de Entrega  
          </label>  
          <input  
            type="date"  
            name="dueDate"  
            value={formData.dueDate}  
            onChange={handleChange}  
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"  
          />  
        </div>  
  
        <motion.button  
          type="submit"  
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 shadow-lg"  
          whileHover={{ scale: 1.02 }}  
          whileTap={{ scale: 0.98 }}  
        >  
          <Save className="w-5 h-5" /> Guardar Proyecto  
        </motion.button>  
      </form>  
  
      {submitted && (  
        <motion.div  
          initial={{ opacity: 0, scale: 0.9 }}  
          animate={{ opacity: 1, scale: 1 }}  
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium"  
        >  
          ¡Proyecto guardado como un diamante! Se añadió a tu lista (datos de prueba).  
        </motion.div>  
      )}  
    </motion.div>  
  );  
};  
  
export default FormAlliance;