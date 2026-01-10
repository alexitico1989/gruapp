// ============================================
// backend/src/controllers/passwordReset.controller.ts
// VERSIÓN ACTUALIZADA PARA TU EMAIL SERVICE
// ============================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import emailService from '../services/email.service'; // ✅ Usando tu servicio

const prisma = new PrismaClient();

export class PasswordResetController {
  /**
   * POST /api/auth/forgot-password
   * Enviar código de recuperación por email
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'El email es requerido',
        });
        return;
      }

      // Buscar usuario por email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Por seguridad, siempre devolvemos success aunque no exista
      if (!user) {
        res.json({
          success: true,
          message: 'Si el email existe, recibirás un código de verificación',
        });
        return;
      }

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Calcular fecha de expiración (15 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Invalidar códigos anteriores del mismo email
      await prisma.passwordReset.updateMany({
        where: {
          email: email.toLowerCase(),
          used: false,
        },
        data: {
          used: true,
        },
      });

      // Crear nuevo código
      await prisma.passwordReset.create({
        data: {
          email: email.toLowerCase(),
          code,
          expiresAt,
        },
      });

      // ✅ Enviar email usando tu servicio
      const emailSent = await emailService.enviarCodigoRecuperacion({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        code,
      });

      if (!emailSent) {
        console.error('❌ Error enviando email a:', email);
      } else {
        console.log('✅ Código de recuperación enviado a:', email);
      }

      res.json({
        success: true,
        message: 'Si el email existe, recibirás un código de verificación',
      });
    } catch (error) {
      console.error('❌ Error en forgotPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud',
      });
    }
  }

  /**
   * POST /api/auth/verify-code
   * Verificar código de recuperación
   */
  static async verifyCode(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).json({
          success: false,
          message: 'Email y código son requeridos',
        });
        return;
      }

      // Buscar código válido
      const passwordReset = await prisma.passwordReset.findFirst({
        where: {
          email: email.toLowerCase(),
          code: code.trim(),
          used: false,
          expiresAt: {
            gte: new Date(), // No expirado
          },
        },
      });

      if (!passwordReset) {
        res.status(400).json({
          success: false,
          message: 'Código inválido o expirado',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Código verificado correctamente',
        data: {
          resetId: passwordReset.id,
        },
      });
    } catch (error) {
      console.error('❌ Error en verifyCode:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar el código',
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Cambiar contraseña con código verificado
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, code, newPassword } = req.body;

      // Validaciones
      if (!email || !code || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
        });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
        });
        return;
      }

      // Validar que cumpla con requisitos de seguridad
      const hasUpperCase = /[A-Z]/.test(newPassword);
      const hasLowerCase = /[a-z]/.test(newPassword);
      const hasNumber = /\d/.test(newPassword);
      const hasSpecialChar = /[@$!%*?&]/.test(newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        res.status(400).json({
          success: false,
          message: 'La contraseña debe contener: mayúscula, minúscula, número y carácter especial (@$!%*?&)',
        });
        return;
      }

      // Buscar código válido
      const passwordReset = await prisma.passwordReset.findFirst({
        where: {
          email: email.toLowerCase(),
          code: code.trim(),
          used: false,
          expiresAt: {
            gte: new Date(),
          },
        },
      });

      if (!passwordReset) {
        res.status(400).json({
          success: false,
          message: 'Código inválido o expirado',
        });
        return;
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }

      // Verificar que la nueva contraseña NO sea igual a la anterior
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        res.status(400).json({
          success: false,
          message: 'La nueva contraseña no puede ser igual a la anterior',
        });
        return;
      }

      // Hash de la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      // Marcar código como usado
      await prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: {
          used: true,
        },
      });

      // ✅ Enviar email de confirmación usando tu servicio
      await emailService.enviarConfirmacionCambioPassword({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
      });

      console.log('✅ Contraseña actualizada para:', user.email);

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cambiar la contraseña',
      });
    }
  }

  /**
   * POST /api/auth/resend-code
   * Reenviar código de recuperación
   */
  static async resendCode(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'El email es requerido',
        });
        return;
      }

      // Buscar si hay un código reciente (menos de 1 minuto)
      const recentCode = await prisma.passwordReset.findFirst({
        where: {
          email: email.toLowerCase(),
          createdAt: {
            gte: new Date(Date.now() - 60000), // Último minuto
          },
        },
      });

      if (recentCode) {
        res.status(429).json({
          success: false,
          message: 'Por favor espera 1 minuto antes de solicitar un nuevo código',
        });
        return;
      }

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        res.json({
          success: true,
          message: 'Si el email existe, recibirás un nuevo código',
        });
        return;
      }

      // Generar nuevo código
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Invalidar códigos anteriores
      await prisma.passwordReset.updateMany({
        where: {
          email: email.toLowerCase(),
          used: false,
        },
        data: {
          used: true,
        },
      });

      // Crear nuevo código
      await prisma.passwordReset.create({
        data: {
          email: email.toLowerCase(),
          code,
          expiresAt,
        },
      });

      // ✅ Enviar email usando tu servicio
      await emailService.enviarCodigoRecuperacion({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        code,
      });

      res.json({
        success: true,
        message: 'Nuevo código enviado',
      });
    } catch (error) {
      console.error('❌ Error en resendCode:', error);
      res.status(500).json({
        success: false,
        message: 'Error al reenviar el código',
      });
    }
  }
}