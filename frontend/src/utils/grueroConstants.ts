/**
 * Constantes para el registro de grueros (Frontend)
 */

export const TIPOS_GRUA = [
  { value: 'CAMA_BAJA', label: 'Cama Baja' },
  { value: 'HORQUILLA', label: 'Horquilla/Levante' },
  { value: 'PLUMA', label: 'Pluma' },
];

export const CAPACIDADES_TONELADAS = [
  { value: 1.5, label: '1.5 toneladas' },
  { value: 2, label: '2 toneladas' },
  { value: 3, label: '3 toneladas' },
  { value: 4, label: '4 toneladas' },
  { value: 5, label: '5 toneladas' },
  { value: 7, label: '7 toneladas' },
  { value: 10, label: '10 toneladas' },
  { value: 15, label: '15 toneladas' },
  { value: 20, label: '20 toneladas' },
];

export const TIPOS_VEHICULO = [
  { value: 'AUTOMOVIL', label: 'Automóvil' },
  { value: 'SUV', label: 'SUV/Camioneta' },
  { value: 'MOTO', label: 'Moto' },
  { value: 'FURGON', label: 'Furgón' },
  { value: 'CAMION_LIVIANO', label: 'Camión Liviano' },
  { value: 'CAMION_MEDIANO', label: 'Camión Mediano' },
  { value: 'CAMION_PESADO', label: 'Camión Pesado' },
  { value: 'BUS', label: 'Bus' },
  { value: 'MAQUINARIA', label: 'Maquinaria' },
];

export const MARCAS_GRUA = [
  'Mercedes-Benz',
  'Volvo',
  'Scania',
  'Freightliner',
  'International',
  'Hino',
  'Isuzu',
  'Chevrolet',
  'Ford',
  'Mitsubishi',
  'Hyundai',
  'JAC',
  'Foton',
  'Otro',
];

export const TIPOS_DOCUMENTO = [
  { value: 'licenciaConducir', label: 'Licencia de Conducir' },
  { value: 'seguroVigente', label: 'Seguro Obligatorio (SOAP)' },
  { value: 'revisionTecnica', label: 'Revisión Técnica' },
  { value: 'permisoCirculacion', label: 'Permiso de Circulación' },
];

// Validación de patente chilena
export const validarPatente = (patente: string): boolean => {
  const patenteFormato1 = /^[A-Z]{2}[0-9]{4}$/; // AA1234
  const patenteFormato2 = /^[A-Z]{4}[0-9]{2}$/; // ABCD12
  
  const patenteLimpia = patente.toUpperCase().replace(/[-\s]/g, '');
  
  return patenteFormato1.test(patenteLimpia) || patenteFormato2.test(patenteLimpia);
};

// Formatear patente
export const formatearPatente = (patente: string): string => {
  return patente.toUpperCase().replace(/[-\s]/g, '');
};