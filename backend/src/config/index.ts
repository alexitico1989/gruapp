import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'tu_clave_secreta_super_segura',
  jwtExpiresIn: '7d',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',
  
  // Mercado Pago
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    publicKey: process.env.MP_PUBLIC_KEY || '',
  },
  
  // Pricing
  pricing: {
    baseFare: parseFloat(process.env.BASE_FARE || '25000'),
    pricePerKm: parseFloat(process.env.PRICE_PER_KM || '1350'),
    platformCommission: parseFloat(process.env.PLATFORM_COMMISSION || '0.15'),
    mpCommission: 0.0349, // 3.49% de Mercado Pago
  },
  
  // OSRM (Routing)
  osrmServer: process.env.OSRM_SERVER || 'http://router.project-osrm.org',
  
  // CORS
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  },
  
  // Gruero search radius (en km)
  grueroSearchRadius: 30,
  
  // Socket.io
  socketPath: '/socket.io',
};
