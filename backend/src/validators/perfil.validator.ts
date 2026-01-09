import { body, ValidationChain } from 'express-validator';

/**
 * Validaciones para actualizar perfil de cliente
 */
export const updateClientePerfilValidation: ValidationChain[] = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('apellido')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
  
  body('telefono')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Teléfono inválido (formato E.164: +56912345678)')
];

/**
 * Validaciones para actualizar perfil de gruero
 */
export const updateGrueroPerfilValidation: ValidationChain[] = [
  body('nombre')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('apellido')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
  
  body('telefono')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Teléfono inválido (formato E.164: +56912345678)'),
  
  body('rut')
    .optional()
    .isString()
    .trim()
    .matches(/^\d{7,8}-[\dkK]$/)
    .withMessage('RUT inválido (formato: 12345678-9)')
];

/**
 * Validaciones para actualizar vehículo del gruero
 */
export const updateVehiculoValidation: ValidationChain[] = [
  body('patente')
    .optional()
    .isString()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{4}\d{2}$/)
    .withMessage('Patente inválida (formato: ABCD12)'),
  
  body('marca')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres'),
  
  body('modelo')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El modelo debe tener entre 2 y 50 caracteres'),
  
  body('capacidadToneladas')
    .optional()
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('La capacidad debe ser entre 0.5 y 100 toneladas'),
  
  body('tipoGrua')
    .optional()
    .isIn(['PLATAFORMA', 'GANCHO', 'LIVIANA', 'PESADA'])
    .withMessage('Tipo de grúa inválido')
];

/**
 * Validaciones para actualizar disponibilidad del gruero
 */
export const updateDisponibilidadValidation: ValidationChain[] = [
  body('disponible')
    .isBoolean()
    .withMessage('El campo disponible debe ser true o false')
];

/**
 * Validaciones para actualizar ubicación del gruero
 */
export const updateLocationValidation: ValidationChain[] = [
  body('latitud')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida (debe estar entre -90 y 90)'),
  
  body('longitud')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida (debe estar entre -180 y 180)'),
  
  body('status')
    .optional()
    .isIn(['DISPONIBLE', 'OCUPADO', 'OFFLINE'])
    .withMessage('Status inválido')
];