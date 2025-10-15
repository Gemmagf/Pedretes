import React, { useState, useEffect } from 'react';  
import { motion } from 'framer-motion';  
import { LayoutDashboard, Clock, DollarSign, AlertTriangle, Calendar, CheckCircle2, Gem } from 'lucide-react';  
import { mockProjects, getOptimalPriceRange, calculateWorkload } from '../mock/projects';  
  
// Fallback para icono de gema si algo falla (usamos Gem de lucide si está, sino SVG simple)  
const GemIcon = ({ className }) => (  
  <Gem className={className} /> // Usamos el de lucide-react como backup seguro  
);  
  
const Dashboard = () => {  
  const [projects, setProjects] = useState(mockProjects);  
  const [workloadThisWeek, setWorkloadThisWeek] = useState({});  
  const [selectedType, setSelectedType] = useState('all');  
  
  useEffect(() => {  
    const weekStart = new Date();  
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());  
    weekStart.setHours(0, 0, 0, 0);  
    setWorkloadThisWeek(calculateWorkload(projects, weekStart));  
  }, [projects]);  
  
  const filteredProjects = selectedType === 'all' ? projects : projects.filter(p => p.type === selectedType);  
  const pending = filteredProjects.filter(p => p.status === 'pending').length;  
  const inProgress = filteredProjects.filter(p => p.status === 'in_progress').length;  
  const completed = filteredProjects.filter(p => p.status === 'completed').length;  
  const totalRevenue = filteredProjects.reduce((sum, p) => sum + (p.status === 'completed' ? p.totalPrice : 0), 0);  
  
  const statusColors = {  
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',  
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',  
    completed: 'bg-green-100 text-green-800 border-green-200'  
  };  
  
  const getStatusLabel = (status) => {  
    switch (status) {  
      case 'pending': return 'Pendiente';  
      case 'in_progress': return 'En Marcha';  
      case 'completed': return 'Completado';  
      default: return 'Desconocido';  
    }  
  };  
  
  return (  
    <motion.div  
      initial={{ opacity: 0, y: 20 }}  
      animate={{ opacity: 1, y: 0 }}  
      transition={{ duration: 0.6 }}  
      className="space-y-8 max-w-7xl mx-auto"  
    >  
      {/* Header del Dashboard */}  
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">  
        <div className="flex items-center gap-3">  
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center">  
            <LayoutDashboard className="w-6 h-6 text-white" />  
          </div>  
          <div>  
            <h2 className="text-2xl font-semibold text-gray-800">Dashboard del Taller - Prototipo Completo</h2>  
            <p className="text-sm text-gray-600">Todo visible: proyectos, cargas, precios óptimos y workflow optimizado con datos ficticios.</p>  
          </div>  
        </div>  
        <div className="flex gap-2">  
          <motion.button  
            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600"  
            whileHover={{ scale: 1.05 }}  
          >  
            + Nuevo Proyecto  
          </motion.button>  
        </div>  
      </div>  
  
      {/* Cards de Resumen - Todo a la vista */}  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">  
        <motion.div  
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50"  
          whileHover={{ y: -2, scale: 1.02 }}  
          transition={{ type: "spring" }}  
        >  
          <div className="flex items-center gap-3 mb-2">  
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">  
              <Clock className="w-5 h-5 text-yellow-600" />  
            </div>  
            <span className="text-sm font-medium text-gray-600">Proyectos en Marcha</span>  
          </div>  
          <h3 className="text-3xl font-bold text-gray-900">{inProgress}</h3>  
          <p className="text-xs text-gray-500 mt-1">De {filteredProjects.length} total</p>  
        </motion.div>  
  
        <motion.div  
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50"  
          whileHover={{ y: -2, scale: 1.02 }}  
        >  
          <div className="flex items-center gap-3 mb-2">  
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">  
              <DollarSign className="w-5 h-5 text-blue-600" />  
            </div>  
            <span className="text-sm font-medium text-gray-600">Ingresos Completados</span>  
          </div>  
          <h3 className="text-3xl font-bold text-gray-900">€{totalRevenue.toLocaleString()}</h3>  
          <p className="text-xs text-gray-500 mt-1">Basado en proyectos terminados</p>  
        </motion.div>  
  
        <motion.div  
          className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${workloadThisWeek.overload ? 'border-red-200' : 'border-gray-200/50'}`}  
          whileHover={{ y: -2, scale: 1.02 }}  
        >  
          <div className="flex items-center gap-3 mb-2">  
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">  
              <Calendar className="w-5 h-5 text-gray-600" />  
            </div>  
            <span className="text-sm font-medium text-gray-600">Carga Semanal</span>  
          </div>  
          <h3 className="text-3xl font-bold text-gray-900">{workloadThisWeek.totalHours || 0}h / {workloadThisWeek.capacity || 40}h</h3>  
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">  
            <div  
              className={`h-2 rounded-full transition-all duration-300 ${workloadThisWeek.overload ? 'bg-red-500' : 'bg-green-500'}`}  
              style={{ width: `${workloadThisWeek.percentage || 0}%` }}  
            ></div>  
          </div>  
          {workloadThisWeek.overload && (  
            <motion.div  
              initial={{ scale: 0, rotate: -10 }}  
              animate={{ scale: 1, rotate: 0 }}  
              className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium"  
            >  
              <AlertTriangle className="w-4 h-4" />  
              ¡Sobrecarga! Reduce para optimizar ( {workloadThisWeek.percentage || 0}% )  
            </motion.div>  
          )}  
        </motion.div>  
  
        <motion.div  
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50"  
          whileHover={{ y: -2, scale: 1.02 }}  
        >  
          <div className="flex items-center gap-3 mb-2">  
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">  
              <CheckCircle2 className="w-5 h-5 text-green-600" />  
            </div>  
            <span className="text-sm font-medium text-gray-600">Completados Total</span>  
          </div>  
          <h3 className="text-3xl font-bold text-gray-900">{completed}</h3>  
          <p className="text-xs text-gray-500 mt-1">Pendientes: {pending}</p>  
        </motion.div>  
      </div>  
  
      {/* Filtros y Navegación Rápida - Todo accesible */}  
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-white/50 rounded-xl p-4">  
        <div className="flex gap-2 flex-wrap">  
          {['all', 'Alliance', 'Fassung', 'Pavé'].map(type => (  
            <motion.button  
              key={type}  
              onClick={() => setSelectedType(type.toLowerCase() === 'all' ? 'all' : type)}  
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${  
                selectedType === (type.toLowerCase() === 'all' ? 'all' : type.toLowerCase())  
                  ? 'bg-amber-500 text-white shadow-md'  
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'  
              }`}  
              whileHover={{ scale: 1.05 }}  
              whileTap={{ scale: 0.95 }}  
            >  
              {type} ({type === 'all' ? filteredProjects.length : filteredProjects.filter(p => p.type === type).length})  
            </motion.button>  
          ))}  
        </div>  
        <div className="flex gap-2 text-sm">  
          <span>Total Proyectos: {projects.length}</span>  
          <span className="text-amber-600 font-medium">Prototipo Activo - Todo Simulado</span>  
        </div>  
      </div>  
  
      {/* Lista Completa de Proyectos - Visibles y Detallados */}  
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50">  
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">  
          <Clock className="w-5 h-5 text-amber-600" /> Todos los Proyectos (Histórico Ficticio)  
          <span className="text-sm text-gray-500">(Carga, precios y optimizaciones a la vista)</span>  
        </h3>  
        {filteredProjects.length === 0 ? (  
          <motion.div  
            initial={{ opacity: 0 }}  
            animate={{ opacity: 1 }}  
            className="text-center py-8 text-gray-500"  
          >  
            No hay proyectos en esta categoría. ¡Crea uno en los formularios!  
          </motion.div>  
        ) : (  
          <div className="space-y-4 max-h-96 overflow-y-auto">  
            {filteredProjects.map((project, index) => (  
              <motion.div  
                key={project.id}  
                initial={{ opacity: 0, x: -20 }}  
                animate={{ opacity: 1, x: 0 }}  
                transition={{ delay: index * 0.05 }}  
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"  
              >  
                <div className="flex-1 mb-3 sm:mb-0">  
                  <div className="flex flex-wrap items-center gap-3 mb-2">  
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}>  
                      {getStatusLabel(project.status)}  
                    </span>  
                    <span className="font-bold text-lg text-gray-900">{project.name}</span>  
                    <span className="text-sm font-medium text-amber-700">({project.type})</span>  
                  </div>  
                  <p className="text-sm text-gray-600 mb-2">{project.client}</p>  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">  
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {project.estimatedHours}h estimado | {project.actualHours || 0}h hecho</span>  
                    {project.gemsCount > 0 && (  
                      <span className="flex items-center gap-1">  
                        <GemIcon className="w-3 h-3 text-purple-600" /> {project.gemsCount} pedras  
                      </span>  
                    )}  
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Inicio: {project.startDate.toLocaleDateString()} | Entrega: {project.dueDate.toLocaleDateString()}</span>  
                    <span className="text-purple-600 font-medium">Notas: {project.notes}</span>  
                  </div>  
                </div>  
                <div className="text-right min-w-[120px]">  
                  <p className="text-xl font-bold text-green-600 mb-1">€{project.totalPrice.toLocaleString()}</p>  
                  <p className="text-xs text-gray-500 break-words">Fórmula: ({project.estimatedHours}h × {project.hourlyRate}€) + {project.materialsCost}€ mats. + {project.margin}% margen</p>  
                  <motion.button  
                    className="mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs hover:bg-amber-200 transition-colors"  
                    whileHover={{ scale: 1.05 }}  
                  >  
                    Optimizar Precio  
                  </motion.button>  
                </div>  
              </motion.div>  
            ))}  
          </div>  
        )}  
      </div>  
  
      {/* Sección de Optimización y Rangos - Siempre Visible */}  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">  
        {['Alliance', 'Fassung', 'Pavé'].map((type, index) => {  
          const typeProjects = projects.filter(p => p.type === type);  
          if (typeProjects.length === 0) return null;  
  
          const sampleGems = typeProjects[0]?.gemsCount || 0;  
          const sampleHours = typeProjects[0]?.estimatedHours || 0;  
          const range = getOptimalPriceRange(type, sampleGems, sampleHours);  
          const avgHistorical = typeProjects.reduce((sum, p) => sum + p.totalPrice, 0) / typeProjects.length;  
  
          return (  
            <motion.div  
              key={type}  
              initial={{ opacity: 0, y: 20 }}  
              animate={{ opacity: 1, y: 0 }}  
              transition={{ delay: index * 0.1 }}  
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-amber-200"  
              whileHover={{ scale: 1.02, y: -2 }}  
            >  
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">  
                <GemIcon className="w-5 h-5 text-purple-600" /> Optimización para {type}  
              </h4>  
              <p className="text-sm text-gray-600 mb-4">Basado en {typeProjects.length} proyectos históricos ficticios</p>  
              <div className="space-y-2 text-sm">  
                <div className="flex justify-between items-center py-2 border-b border-gray-100">  
                  <span>Ejemplo: {sampleGems} pedras, {sampleHours}h</span>  
                  <span className="text-purple-600 font-medium">€{range.suggested.toLocaleString()}</span>  
                </div>  
                <div className="flex justify-between items-center py-1">  
                  <span className="text-xs text-gray-500">Rango Óptimo:</span>  
                  <span className="text-xs font-semibold">€{range.min.toLocaleString()} - €{range.max.toLocaleString()}</span>  
                </div>  
                <div className="flex justify-between items-center py-1">  
                  <span className="text-xs text-green-600">Promedio Histórico:</span>  
                  <span className="text-xs font-semibold text-green-600">€{Math.round(avgHistorical).toLocaleString()}</span>  
                </div>  
                <p className="text-xs text-gray-500 mt-3">Consejo: Ajusta por materiales y tiempo para maximizar margen (25-35%).</p>  
              </div>  
            </motion.div>  
          );  
        })}  
      </div>  
    </motion.div>  
  );  
};  
  
export default Dashboard;