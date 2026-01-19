/**
 * Constantes para el registro de grueros (Frontend)
 */

// Tipos de grúa (Objeto plano para Object.entries)
export const TIPOS_GRUA: Record<string, string> = {
  CAMA_BAJA: 'Cama Baja',
  HORQUILLA: 'Horquilla/Levante',
  PLUMA: 'Pluma',
};

// Capacidades en toneladas (Array simple para .map())
export const CAPACIDADES_TONELADAS = ['1.5', '2', '3', '4', '5', '7', '10', '15', '20'];

// Tipos de vehículos (Objeto plano para Object.entries)
export const TIPOS_VEHICULO: Record<string, string> = {
  AUTOMOVIL: 'Automóvil',
  SUV: 'SUV/Camioneta',
  MOTO: 'Moto',
  FURGON: 'Furgón',
  CAMION_LIVIANO: 'Camión Liviano',
  CAMION_MEDIANO: 'Camión Mediano',
  CAMION_PESADO: 'Camión Pesado',
  BUS: 'Bus',
  MAQUINARIA: 'Maquinaria',
};

// Marcas de grúa (Array simple)
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

// Tipos de documento (Array de objetos - mantener formato si se usa en otro lugar)
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