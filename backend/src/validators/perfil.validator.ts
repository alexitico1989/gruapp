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
  
  // ✅ CORREGIDO: RUT con limpieza de puntos
  body('rut')
    .optional()
    .isString()
    .trim()
    .customSanitizer((value) => {
      return value.replace(/\./g, '').replace(/\s/g, '');
    })
    .matches(/^\d{7,8}-[\dkK]$/)
    .withMessage('RUT inválido (formato: 12345678-9 o 12.345.678-9)')
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
  .matches(/^([A-Z]{4}\d{2}|[A-Z]{2}\d{4})$/)
  .withMessage('Patente inválida (formato: ABCD12 o AB1234)'),


  
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
  
  // ✅ CORREGIDO: Tipos de grúa según schema.prisma
  body('tipoGrua')
    .optional()
    .isIn(['CAMA_BAJA', 'HORQUILLA', 'PLUMA'])
    .withMessage('Tipo de grúa inválido (debe ser: CAMA_BAJA, HORQUILLA o PLUMA)')
];

/**
 * Validaciones para actualizar disponibilidad del gruero
 */
export const updateDisponibilidadValidation: ValidationChain[] = [
  // ✅ CORREGIDO: Validación más flexible para disponible
  body('disponible')
    .exists()
    .withMessage('El campo disponible es requerido')
    .custom((value) => {
      // Aceptar boolean o string 'true'/'false'
      if (value === true || value === false || value === 'true' || value === 'false') {
        return true;
      }
      throw new Error('El campo disponible debe ser true o false');
    })
    .customSanitizer((value) => {
      // Convertir string a boolean si es necesario
      if (value === 'true') return true;
      if (value === 'false') return false;
      return Boolean(value);
    })
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