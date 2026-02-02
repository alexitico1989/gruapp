import { body, ValidationChain } from 'express-validator';

/**
 * Validaciones para registro de cliente
 */
export const registerClienteValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase()
    .trim(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una minúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos un carácter especial (@$!%*?&)'),
  
  body('nombre')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('apellido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
  
  body('telefono')
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Teléfono inválido (formato E.164: +56912345678)')
];

/**
 * Validaciones para registro de gruero
 */
export const registerGrueroValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase()
    .trim(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La contraseña debe contener al menos una mayúscula')
    .matches(/[a-z]/)
    .withMessage('La contraseña debe contener al menos una minúscula')
    .matches(/[0-9]/)
    .withMessage('La contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos un carácter especial (@$!%*?&)'),
  
  body('nombre')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),
  
  body('apellido')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El apellido solo puede contener letras'),
  
  body('telefono')
    .isString()
    .trim()
    .matches(/^[A-Z]{2,4}\d{2,4}$/)
    .withMessage('Teléfono inválido (formato E.164: +56912345678)'),
  
  // ✅ CORREGIDO: Acepta RUT con o sin puntos
  body('rut')
    .isString()
    .trim()
    .customSanitizer((value) => {
      // Remover puntos y espacios
      return value.replace(/\./g, '').replace(/\s/g, '');
    })
    .matches(/^\d{7,8}-[\dkK]$/)
    .withMessage('RUT inválido (formato: 12345678-9 o 12.345.678-9)'),
  
  body('patente')
    .isString()
    .trim()
    .toUpperCase()
    .matches(/^[A-Z]{2,4}\d{2,4}$/)
    .withMessage('Patente inválida (formato: ABCD12)'),
  
  body('marca')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marca debe tener entre 2 y 50 caracteres'),
  
  body('modelo')
    .isString()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El modelo debe tener entre 2 y 50 caracteres'),
  
  body('capacidadToneladas')
    .isFloat({ min: 0.5, max: 100 })
    .withMessage('La capacidad debe ser entre 0.5 y 100 toneladas'),
  
  // ✅ CORREGIDO: Agregados los tipos correctos según schema.prisma
  body('tipoGrua')
    .isIn(['CAMA_BAJA', 'HORQUILLA', 'PLUMA'])
    .withMessage('Tipo de grúa inválido (debe ser: CAMA_BAJA, HORQUILLA o PLUMA)')
];

/**
 * Validaciones para login
 */
export const loginValidation: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .toLowerCase()
    .trim(),
  
  body('password')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

/**
 * Validaciones para cambio de contraseña
 */
export const changePasswordValidation: ValidationChain[] = [
  body('passwordActual')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('passwordNueva')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula')
    .matches(/[a-z]/)
    .withMessage('La nueva contraseña debe contener al menos una minúscula')
    .matches(/[0-9]/)
    .withMessage('La nueva contraseña debe contener al menos un número')
    .matches(/[@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos un carácter especial (@$!%*?&)')
    .custom((value, { req }) => {
      if (value === req.body.passwordActual) {
        throw new Error('La nueva contraseña debe ser diferente a la actual');
      }
      return true;
    })
];
