import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import serveStatic from 'serve-static';
import { config } from './config';
import routes from './routes';
import notificacionRoutes from './routes/notificacion.routes';
import reclamoRoutes from './routes/reclamo.routes';
import clienteRoutes from './routes/cliente.routes';
import pagoRoutes from './routes/pago.routes';
import { ErrorHandlerMiddleware } from './middlewares/errorHandler.middleware';
import { setupSocketHandlers } from './socket/socketHandler';
import passwordResetRoutes from './routes/passwordReset.routes';

// ============================================
// IMPORTAR MIDDLEWARES DE SEGURIDAD
// ============================================
import {
  helmetConfig,
  mongoSanitizeMiddleware,
  hppMiddleware,
  xssProtection,
  securityLogger,
  additionalSecurityHeaders,
} from './middlewares/security.middleware';

import {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  sensitiveLimiter,
  webhookLimiter,
} from './middlewares/rateLimiter.middleware';

import { checkIPBlacklist } from './middlewares/ipBlacklist.middleware';

const app: Application = express();
const httpServer = createServer(app);

// ============================================
// TRUST PROXY (IMPORTANTE PARA RAILWAY/HEROKU)
// ============================================
// Confiar en el primer proxy (Railway, Heroku, etc)
app.set('trust proxy', 1);

// Configurar Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.nodeEnv === 'production' 
      ? ['https://www.gruappchile.cl', 'https://gruappchile.cl']
      : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: config.socketPath,
});

// Hacer io accesible desde req en todos los controladores
app.set('io', io);

// ============================================
// MIDDLEWARES DE SEGURIDAD (ORDEN IMPORTANTE)
// ============================================

// 0. IP Blacklist - PRIMERA LÍNEA DE DEFENSA
app.use(checkIPBlacklist);

// 1. Helmet - Headers de seguridad HTTP
app.use(helmetConfig);

// 2. Headers adicionales de seguridad
app.use(additionalSecurityHeaders);

// 3. CORS configurado según entorno
app.use(
  cors({
    origin: config.nodeEnv === 'production'
      ? ['https://www.gruappchile.cl', 'https://gruappchile.cl']
      : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 4. Body parsers
app.use(express.json({ limit: '10mb' })); // Límite de 10MB para JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Sanitización contra NoSQL injection
app.use(mongoSanitizeMiddleware);

// 6. Protección contra HTTP Parameter Pollution
app.use(hppMiddleware);

// 7. Protección XSS en todos los inputs
app.use(xssProtection);

// 8. Logger de seguridad (detecta requests sospechosos)
app.use(securityLogger);

// ============================================
// ✅ RUTAS EXCLUIDAS DE RATE LIMITING
// ============================================
// Estas rutas NO tienen límite (uso normal de la app)
const excludedFromRateLimit = [
  '/api/servicios/solicitar',
  '/api/servicios/pendientes',
  '/api/servicios/mis-servicios',
  '/api/servicios/:id',
  '/api/servicios/:id/estado',
  '/api/servicios/:id/aceptar',
  '/api/servicios/:id/cancelar',
  '/api/gruero/disponibilidad',
  '/api/gruero/location',
  '/api/gruero/perfil',
  '/api/gruero/estadisticas',
  '/api/cliente/perfil',
  '/api/cliente/dashboard',
  '/api/notificaciones',
];

// 9. Rate limiting general CON EXCEPCIONES
app.use('/api', (req, res, next) => {
  // ✅ Excluir rutas específicas del rate limiting
  const isExcluded = excludedFromRateLimit.some(route => {
    const routePattern = route.replace(/:\w+/g, '[^/]+'); // Convertir :id a regex
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(req.path);
  });

  if (isExcluded) {
    console.log(`⚡ Rate limiting DESHABILITADO para: ${req.path}`);
    return next(); // Skip rate limiting
  }

  // Aplicar rate limiting general para las demás rutas
  generalLimiter(req, res, next);
});

// ============================================
// SERVIR ARCHIVOS ESTÁTICOS
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// LOGGER SIMPLE
// ============================================
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// RUTAS API CON RATE LIMITING ESPECÍFICO
// ============================================

// Rutas de autenticación con rate limiting estricto
app.use('/api/auth/login', loginLimiter);
app.use('/api/gruero/login', loginLimiter);
app.use('/api/cliente/login', loginLimiter);
app.use('/api/admin/login', loginLimiter);

// Rutas de registro con rate limiting
app.use('/api/auth/register', registerLimiter);
app.use('/api/gruero/register', registerLimiter);
app.use('/api/cliente/register', registerLimiter);

// Rutas de pagos con rate limiting sensible
app.use('/api/pagos/crear-preferencia', sensitiveLimiter);

// Webhooks con rate limiting especial
app.use('/api/pagos/webhook', webhookLimiter);

// Rutas generales
app.use('/api', routes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/reclamos', reclamoRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/pagos', pagoRoutes);

// ============================================
// SERVIR SERVICE WORKERS (SIN CACHE)
// ============================================
app.get('/OneSignalSDKWorker.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/OneSignalSDKWorker.js'));
});

app.get('/OneSignalSDK.sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/OneSignalSDKWorker.js'));
});

// ============================================
// SERVIR FRONTEND ESTÁTICO
// ============================================
const publicPath = path.join(__dirname, '../public');
app.use(serveStatic(publicPath, {
  maxAge: '1d', // Cache de 1 día para archivos estáticos
  setHeaders: (res, path) => {
    // No cachear index.html
    if (path.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// ============================================
// RUTA CATCH-ALL PARA SPA
// ============================================
app.get('*', (req, res) => {
  // Si la ruta empieza con /api, devolver 404
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
    });
  }
  
  // Para cualquier otra ruta, servir index.html (SPA)
  return res.sendFile(path.join(publicPath, 'index.html'));
});

// ============================================
// MANEJO DE ERRORES (DEBE IR AL FINAL)
// ============================================
app.use(ErrorHandlerMiddleware.handle);

app.use('/api/auth', passwordResetRoutes);

// ============================================
// CONFIGURAR SOCKET.IO HANDLERS
// ============================================
setupSocketHandlers(io);


// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || config.port;

httpServer.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚛 Servidor Grúas Chile iniciado`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`🔐 Seguridad: ✅ HABILITADA`);
  console.log(`🛡️  Rate Limiting: ✅ ACTIVO (con excepciones)`);
  console.log(`⚡ Rutas sin límite: ${excludedFromRateLimit.length}`);
  console.log(`🔒 XSS Protection: ✅ ACTIVO`);
  console.log(`🚫 NoSQL Injection: ✅ BLOQUEADO`);
  console.log(`🚷 IP Blacklist: ✅ ACTIVO`);
  console.log(`🚀 API: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO: http://localhost:${PORT}${config.socketPath}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('===========================================');
});

// Exportar io para usar en otros archivos si es necesario
export { io };