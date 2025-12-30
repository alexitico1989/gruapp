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
import { CronService } from './services/cron.service';


const app: Application = express();
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: config.socketPath,
});

// Hacer io accesible desde req en todos los controladores
app.set('io', io);

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas API
app.use('/api', routes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/reclamos', reclamoRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/pagos', pagoRoutes);

// Servir frontend estático (DESPUÉS de las rutas API)
const publicPath = path.join(__dirname, '../public');
app.use(serveStatic(publicPath));

// Ruta catch-all para SPA (debe ir al final)
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

// Manejo de errores (debe ir al final)
app.use(ErrorHandlerMiddleware.handle);

// Configurar Socket.IO handlers
setupSocketHandlers(io);

// Iniciar Cron Jobs
CronService.init();

// Iniciar servidor
const PORT = process.env.PORT || config.port;

httpServer.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚛 Servidor Grúas Chile iniciado`);
  console.log(`🌍 Entorno: ${config.nodeEnv}`);
  console.log(`🚀 API: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO: http://localhost:${PORT}${config.socketPath}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log('===========================================');
});

// Exportar io para usar en otros archivos si es necesario
export { io };