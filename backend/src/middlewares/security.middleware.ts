import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * Configuración de Helmet para headers de seguridad
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://fonts.googleapis.com",
        "https://unpkg.com", // ✅ Leaflet CSS
        "https://cdnjs.cloudflare.com", // ✅ Leaflet markers
        "https://onesignal.com" // ✅ OneSignal CSS
      ],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdn.onesignal.com", // ✅ OneSignal SDK
        "https://api.onesignal.com" // ✅ OneSignal API scripts
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https:", 
        "blob:",
        "https://*.tile.openstreetmap.org", // ✅ Tiles de OSM
        "https://unpkg.com", // ✅ Leaflet images
        "https://cdnjs.cloudflare.com", // ✅ Leaflet markers
        "https://raw.githubusercontent.com", // ✅ Markers personalizados
        "https://img.onesignal.com" // ✅ OneSignal images
      ],
      connectSrc: [
        "'self'", 
        "https://gruapp-production.up.railway.app", 
        "wss://gruapp-production.up.railway.app",
        "https://nominatim.openstreetmap.org", // ✅ Geocoding
        "https://router.project-osrm.org", // ✅ Rutas
        "https://*.tile.openstreetmap.org", // ✅ Tiles
        "https://onesignal.com", // ✅ OneSignal API
        "https://*.onesignal.com" // ✅ OneSignal subdominios
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://onesignal.com" // ✅ OneSignal iframes
      ],
      workerSrc: [
        "'self'",
        "blob:" // ✅ Service Workers
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Necesario para algunos recursos externos
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

/**
 * Middleware para sanitizar datos de MongoDB
 * Previene NoSQL injection
 */
export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }: { req: any; key: string }) => {
    console.warn(`⚠️ Intento de NoSQL injection detectado en ${req.path} - key: ${key}`);
  },
});

/**
 * Middleware para prevenir HTTP Parameter Pollution
 */
export const hppMiddleware = hpp({
  whitelist: ['sort', 'filter', 'limit', 'page'], // Parámetros permitidos duplicados
});

/**
 * Middleware personalizado para sanitizar XSS en inputs
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitizar query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitizar params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Función recursiva para sanitizar objetos
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Sanitizar string con sanitize-html
    return sanitizeHtml(obj, {
      allowedTags: [], // No permitir ningún tag HTML
      allowedAttributes: {}, // No permitir ningún atributo
    });
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware para logging de requests sospechosos
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /\$where/i,
    /\$ne/i,
    /'.*or.*'/i,
    /union.*select/i,
    /\.\.\//, // Path traversal
  ];
  
  const checkForSuspicious = (data: any): boolean => {
    const str = JSON.stringify(data);
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };
  
  if (checkForSuspicious(req.body) || checkForSuspicious(req.query) || checkForSuspicious(req.params)) {
    console.error('🚨 ALERTA DE SEGURIDAD:', {
      ip: req.ip,
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString(),
    });
    
    // Opcional: Bloquear la request
    // return res.status(403).json({
    //   success: false,
    //   message: 'Request bloqueada por razones de seguridad'
    // });
  }
  
  next();
};

/**
 * Middleware para agregar headers de seguridad adicionales
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection en navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');
  
  next();
};