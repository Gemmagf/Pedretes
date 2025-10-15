export const mockProjects = [  
  {  
    id: '1',  
    type: 'Alliance',  
    name: 'Alianza Dorada Premium',  
    client: 'Joyería España S.A.',  
    status: 'in_progress',  
    estimatedHours: 15,  
    actualHours: 8,  
    materialsCost: 150,  
    gemsCount: 20,  
    hourlyRate: 50,  
    margin: 25,  
    startDate: new Date('2024-10-01'),  
    dueDate: new Date('2024-10-15'),  
    totalPrice: 1125,  
    notes: 'Alta calidad, oro 18k'  
  },  
  {  
    id: '2',  
    type: 'Fassung',  
    name: 'Fassung Clásica',  
    client: 'Cliente VIP',  
    status: 'completed',  
    estimatedHours: 10,  
    actualHours: 9,  
    materialsCost: 200,  
    gemsCount: 0,  
    hourlyRate: 50,  
    margin: 20,  
    startDate: new Date('2024-09-20'),  
    dueDate: new Date('2024-10-05'),  
    totalPrice: 700,  
    notes: 'Engaste simple'  
  },  
  {  
    id: '3',  
    type: 'Pavé',  
    name: 'Pavé Brillante',  
    client: 'Alta Joyería',  
    status: 'pending',  
    estimatedHours: 25,  
    actualHours: 0,  
    materialsCost: 300,  
    gemsCount: 50,  
    hourlyRate: 50,  
    margin: 30,  
    startDate: new Date('2024-10-10'),  
    dueDate: new Date('2024-11-01'),  
    totalPrice: 1825,  
    notes: 'Diamantes finos'  
  },  
  {  
    id: '4',  
    type: 'Alliance',  
    name: 'Alianza Simple',  
    client: 'Cliente Regular',  
    status: 'completed',  
    estimatedHours: 8,  
    actualHours: 7,  
    materialsCost: 100,  
    gemsCount: 10,  
    hourlyRate: 50,  
    margin: 15,  
    startDate: new Date('2024-09-15'),  
    dueDate: new Date('2024-09-25'),  
    totalPrice: 515,  
    notes: 'Básica para boda'  
  },  
  {  
    id: '5',  
    type: 'Pavé',  
    name: 'Pavé Extravagante',  
    client: 'Joyería Internacional',  
    status: 'in_progress',  
    estimatedHours: 30,  
    actualHours: 12,  
    materialsCost: 400,  
    gemsCount: 80,  
    hourlyRate: 50,  
    margin: 35,  
    startDate: new Date('2024-10-05'),  
    dueDate: new Date('2024-10-25'),  
    totalPrice: 2425,  
    notes: 'Alta gama'  
  }  
];  
  
// Función para inferir rangos óptimos basados en histórico ficticio  
export const getOptimalPriceRange = (type, gemsCount, estimatedHours) => {  
  const historical = mockProjects.filter(p => p.type === type);  
  if (historical.length === 0) return { min: 0, max: 0, avg: 0 };  
  
  const avgPrice = historical.reduce((sum, p) => sum + p.totalPrice, 0) / historical.length;  
  const avgGems = historical.reduce((sum, p) => sum + p.gemsCount, 0) / historical.length;  
  const gemAdjustment = gemsCount / (avgGems || 1);  
  const hoursAdjustment = estimatedHours / historical.reduce((sum, p) => sum + p.estimatedHours, 0) / historical.length;  
  
  const basePrice = (estimatedHours * 50) + (gemsCount * 10) + 100; // Fórmula simple: tiempo + pedras * valor + base  
  const optimalMin = basePrice * 0.9;  
  const optimalMax = basePrice * 1.2;  
  const optimalAvg = (optimalMin + optimalMax) / 2;  
  
  return {  
    min: Math.round(optimalMin),  
    max: Math.round(optimalMax),  
    avg: Math.round(optimalAvg),  
    suggested: historical.length > 2 ? optimalAvg : basePrice  
  };  
};  
  
// Calcular carga de trabajo semanal (capacidad max: 40 horas)  
export const calculateWorkload = (projects, weekStart) => {  
  const weekProjects = projects.filter(p => {  
    const start = new Date(p.startDate);  
    return start >= weekStart && start <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);  
  });  
  const totalHours = weekProjects.reduce((sum, p) => sum + p.estimatedHours, 0);  
  const capacity = 40;  
  const overload = totalHours > capacity;  
  return { totalHours, capacity, overload, percentage: Math.round((totalHours / capacity) * 100) };  
};