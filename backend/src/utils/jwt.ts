import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload, UserRole } from '../types';

export class JWTService {
  /**
   * Genera un token JWT para un usuario
   */
  static generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JWTPayload = {
      userId,
      email,
      role,
    };
    
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }
  
  /**
   * Verifica y decodifica un token JWT
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as JWTPayload;
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }
  
  /**
   * Extrae el token del header Authorization
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    return authHeader.substring(7); // Remueve "Bearer "
  }
}