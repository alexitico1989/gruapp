/**
 * Tipos de Grúas en Chile
 */
export const TIPOS_GRUA = {
  CAMA_BAJA: 'Cama Baja',
  HORQUILLA: 'Horquilla/Levante',
  PLUMA: 'Pluma',
} as const;

export type TipoGrua = keyof typeof TIPOS_GRUA;

/**
 * Capacidades de carga disponibles (en toneladas)
 */
export const CAPACIDADES_TONELADAS = [
  1.5,
  2,
  3,
  4,
  5,
  7,
  10,
  15,
  20,
] as const;

export type CapacidadToneladas = typeof CAPACIDADES_TONELADAS[number];

/**
 * Tipos de Vehículos que puede atender una grúa
 */
export const TIPOS_VEHICULO = {
  AUTOMOVIL: 'Automóvil',
  SUV: 'SUV/Camioneta',
  MOTO: 'Moto',
  FURGON: 'Furgón',
  CAMION_LIVIANO: 'Camión Liviano',
  CAMION_MEDIANO: 'Camión Mediano',
  CAMION_PESADO: 'Camión Pesado',
  BUS: 'Bus',
  MAQUINARIA: 'Maquinaria',
} as const;

export type TipoVehiculo = keyof typeof TIPOS_VEHICULO;

/**
 * Marcas de grúas comunes en Chile
 */
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
] as const;

/**
 * Estados de verificación del gruero
 */
export const ESTADOS_VERIFICACION = {
  PENDIENTE: 'Pendiente de Aprobación',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
} as const;

export type EstadoVerificacion = keyof typeof ESTADOS_VERIFICACION;

/**
 * Tarifas base por tipo de vehículo (en CLP)
 * Estas se pueden ajustar según la capacidad de la grúa
 */
export const TARIFAS_BASE_VEHICULO: Record<TipoVehiculo, number> = {
  AUTOMOVIL: 25000,
  SUV: 25000,
  MOTO: 25000,
  FURGON: 25000,
  CAMION_LIVIANO: 80000,
  CAMION_MEDIANO: 80000,
  CAMION_PESADO: 80000,
  BUS: 80000,
  MAQUINARIA: 80000,
};

/**
 * Multiplicador de precio por capacidad de grúa
 * Grúas más grandes cobran más
 */
export const MULTIPLICADOR_CAPACIDAD: Record<number, number> = {
  1.5: 1.0,
  2: 1.0,
  3: 1.1,
  4: 1.15,
  5: 1.2,
  7: 1.3,
  10: 1.4,
  15: 1.5,
  20: 1.6,
};

/**
 * Validar que los tipos de vehículos sean compatibles con la capacidad de la grúa
 */
export const COMPATIBILIDAD_CAPACIDAD: Record<number, TipoVehiculo[]> = {
  1.5: ['AUTOMOVIL', 'MOTO'],
  2: ['AUTOMOVIL', 'SUV', 'MOTO'],
  3: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON'],
  4: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO'],
  5: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO'],
  7: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO', 'CAMION_MEDIANO'],
  10: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO', 'CAMION_MEDIANO', 'BUS'],
  15: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO', 'CAMION_MEDIANO', 'CAMION_PESADO', 'BUS', 'MAQUINARIA'],
  20: ['AUTOMOVIL', 'SUV', 'MOTO', 'FURGON', 'CAMION_LIVIANO', 'CAMION_MEDIANO', 'CAMION_PESADO', 'BUS', 'MAQUINARIA'],
};