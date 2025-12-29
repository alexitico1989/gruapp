import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../utils/password';
import { JWTService } from '../utils/jwt';
import { RegisterClienteDTO, RegisterGrueroDTO, LoginDTO } from '../types';
import { RutValidator } from '../utils/rutValidator';
import EmailService from '../services/email.service';

const prisma = new PrismaClient();

export class AuthController {
  /**
   * Registro de un nuevo cliente
   */
  static async registerCliente(req: Request, res: Response) {
    try {
      console.log('🔵 INICIANDO REGISTRO DE CLIENTE');
      const data: RegisterClienteDTO = req.body;
      console.log('🔵 Datos recibidos:', { email: data.email, nombre: data.nombre, apellido: data.apellido });
      
      // Validar RUT si se proporciona
      if (data.rut) {
        console.log('🔵 Validando RUT...');
        if (!RutValidator.validar(data.rut)) {
          return res.status(400).json({
            success: false,
            message: 'RUT inválido',
          });
        }
      }
      
      // Validar contraseña
      console.log('🔵 Validando contraseña...');
      const passwordValidation = PasswordService.validate(data.password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
        });
      }
      
      // Hash de la contraseña
      console.log('🔵 Hasheando contraseña...');
      const hashedPassword = await PasswordService.hash(data.password);
      
      // Formatear RUT si existe
      const rutFormateado = data.rut ? RutValidator.formatear(data.rut) : null;
      
      // Crear usuario y perfil de cliente
      console.log('🔵 Creando usuario en base de datos...');
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'CLIENTE',
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          rut: rutFormateado,
          clienteProfile: {
            create: {},
          },
        },
        include: {
          clienteProfile: true,
        },
      });
      
      console.log('🔵 Usuario creado exitosamente:', user.id);
      
      // 📧 ENVIAR EMAIL DE BIENVENIDA (asíncrono, no bloquea)
      console.log('🔵 Programando envío de email...');
      setImmediate(() => {
        console.log('🔵 Enviando email a:', user.email);
        EmailService.enviarBienvenidaCliente({
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
        }).catch((error) => {
          console.error('❌ Error al enviar email de bienvenida:', error);
        });
      });
      
      // Generar token
      console.log('🔵 Generando token...');
      const token = JWTService.generateToken(user.id, user.email, 'CLIENTE');
      
      console.log('🔵 Enviando respuesta exitosa');
      return res.status(201).json({
        success: true,
        message: 'Cliente registrado exitosamente',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            telefono: user.telefono,
            role: user.role,
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('❌❌❌ ERROR EN CATCH AL REGISTRAR CLIENTE:', error);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Code:', error.code);
      console.error('❌ Error completo:', JSON.stringify(error, null, 2));
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'El email o RUT ya está registrado',
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al registrar cliente',
        error: error.message,
        details: error.toString(),
      });
    }
  }
  
  /**
   * Registro de un nuevo gruero
   */
  static async registerGruero(req: Request, res: Response) {
    try {
      console.log('🔵 INICIANDO REGISTRO DE GRUERO');
      const data: RegisterGrueroDTO = req.body;
      console.log('🔵 Datos recibidos:', { email: data.email, nombre: data.nombre, apellido: data.apellido });
      
      // Validar RUT (obligatorio para grueros)
      if (!data.rut) {
        return res.status(400).json({
          success: false,
          message: 'El RUT es obligatorio para grueros',
        });
      }
      
      console.log('🔵 Validando RUT...');
      if (!RutValidator.validar(data.rut)) {
        return res.status(400).json({
          success: false,
          message: 'RUT inválido',
        });
      }
      
      // Validar contraseña
      console.log('🔵 Validando contraseña...');
      const passwordValidation = PasswordService.validate(data.password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.error,
        });
      }
      
      // Hash de la contraseña
      console.log('🔵 Hasheando contraseña...');
      const hashedPassword = await PasswordService.hash(data.password);
      
      // Formatear RUT
      const rutFormateado = RutValidator.formatear(data.rut);
      
      // Formatear patente (uppercase y sin espacios)
      const patenteFormateada = data.patente.toUpperCase().replace(/\s/g, '');
      
      // Parsear tipos de vehículos (puede venir como array o string JSON)
      let tiposVehiculosAtiende = '[]';
      if (data.tiposVehiculosAtiende) {
        if (Array.isArray(data.tiposVehiculosAtiende)) {
          tiposVehiculosAtiende = JSON.stringify(data.tiposVehiculosAtiende);
        } else if (typeof data.tiposVehiculosAtiende === 'string') {
          tiposVehiculosAtiende = data.tiposVehiculosAtiende;
        }
      }
      
      // Crear usuario y perfil de gruero
      console.log('🔵 Creando usuario en base de datos...');
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'GRUERO',
          nombre: data.nombre,
          apellido: data.apellido,
          telefono: data.telefono,
          rut: rutFormateado,
          grueroProfile: {
            create: {
              patente: patenteFormateada,
              marca: data.marca,
              modelo: data.modelo,
              anio: data.anio,
              tipoGrua: data.tipoGrua || 'CAMA_BAJA',
              capacidadToneladas: data.capacidadToneladas,
              tiposVehiculosAtiende: tiposVehiculosAtiende,
              status: 'OFFLINE',
              verificado: false,
              estadoVerificacion: 'PENDIENTE',
            },
          },
        },
        include: {
          grueroProfile: true,
        },
      });
      
      console.log('🔵 Usuario creado exitosamente:', user.id);
      
      // 📧 ENVIAR EMAIL DE BIENVENIDA (asíncrono, no bloquea)
      console.log('🔵 Programando envío de email...');
      setImmediate(() => {
        console.log('🔵 Enviando email a:', user.email);
        EmailService.enviarBienvenidaGruero({
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
        }).catch((error) => {
          console.error('❌ Error al enviar email de bienvenida:', error);
        });
      });
      
      // Generar token
      console.log('🔵 Generando token...');
      const token = JWTService.generateToken(user.id, user.email, 'GRUERO');
      
      console.log('🔵 Enviando respuesta exitosa');
      return res.status(201).json({
        success: true,
        message: 'Gruero registrado exitosamente. Pendiente de verificación.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            telefono: user.telefono,
            role: user.role,
            gruero: {
              id: user.grueroProfile?.id,
              patente: user.grueroProfile?.patente,
              verificado: user.grueroProfile?.verificado,
              estadoVerificacion: user.grueroProfile?.estadoVerificacion,
            },
          },
          token,
        },
      });
    } catch (error: any) {
      console.error('❌❌❌ ERROR EN CATCH AL REGISTRAR GRUERO:', error);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Code:', error.code);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'El email, RUT o patente ya está registrado',
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al registrar gruero',
        error: error.message,
      });
    }
  }
  
  /**
   * Login de usuario (cliente o gruero)
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginDTO = req.body;
      
      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          clienteProfile: true,
          grueroProfile: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }
      
      // Verificar contraseña
      const isPasswordValid = await PasswordService.verify(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas',
        });
      }
      
      // Generar token
      const token = JWTService.generateToken(user.id, user.email, user.role as any);
      
      return res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre,
            apellido: user.apellido,
            telefono: user.telefono,
            role: user.role,
            ...(user.role === 'GRUERO' && {
              gruero: {
                id: user.grueroProfile?.id,
                patente: user.grueroProfile?.patente,
                verificado: user.grueroProfile?.verificado,
                status: user.grueroProfile?.status,
                estadoVerificacion: user.grueroProfile?.estadoVerificacion,
              },
            }),
            ...(user.role === 'CLIENTE' && {
              cliente: {
                id: user.clienteProfile?.id,
              },
            }),
          },
          token,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message,
      });
    }
  }
  
  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          clienteProfile: true,
          grueroProfile: true,
        },
        
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }
      
      // No enviar la contraseña
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message,
      });
    }
  }
}