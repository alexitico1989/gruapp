import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class GrueroPerfilController {
  /**
   * Actualizar datos del vehículo
   */
  static async actualizarVehiculo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { marca, modelo, anio, tipoGrua, capacidadToneladas, tiposVehiculosAtiende } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      // Validar campos requeridos
      if (!marca || !modelo || !anio || !capacidadToneladas) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos',
        });
      }

      // Validar tipos de vehículos
      if (!Array.isArray(tiposVehiculosAtiende) || tiposVehiculosAtiende.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selecciona al menos un tipo de vehículo',
        });
      }

      // Convertir a JSON string
      const tiposVehiculosString = JSON.stringify(tiposVehiculosAtiende);

      // Actualizar perfil del gruero
      const grueroActualizado = await prisma.gruero.updateMany({
        where: { userId },
        data: {
          marca: marca.trim(),
          modelo: modelo.trim(),
          anio: parseInt(anio),
          tipoGrua,
          capacidadToneladas: parseFloat(capacidadToneladas),
          tiposVehiculosAtiende: tiposVehiculosString,
        },
      });

      if (grueroActualizado.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de gruero no encontrado',
        });
      }

      return res.json({
        success: true,
        message: 'Datos del vehículo actualizados correctamente',
      });
    } catch (error: any) {
      console.error('Error actualizando vehículo:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar datos del vehículo',
        error: error.message,
      });
    }
  }

  /**
   * Actualizar cuenta bancaria
   */
  static async actualizarCuentaBancaria(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { banco, tipoCuenta, numeroCuenta, nombreTitular, rutTitular, emailTransferencia } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado',
        });
      }

      // Validar campos requeridos
      if (!banco || !numeroCuenta || !nombreTitular || !rutTitular) {
        return res.status(400).json({
          success: false,
          message: 'Banco, número de cuenta, titular y RUT son requeridos',
        });
      }

      // Actualizar perfil del gruero
      const grueroActualizado = await prisma.gruero.updateMany({
        where: { userId },
        data: {
          banco: banco.trim(),
          tipoCuenta: tipoCuenta || 'CUENTA_RUT',
          numeroCuenta: numeroCuenta.trim(),
          nombreTitular: nombreTitular.trim(),
          rutTitular: rutTitular.trim(),
          emailTransferencia: emailTransferencia ? emailTransferencia.trim() : null,
        },
      });

      if (grueroActualizado.count === 0) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de gruero no encontrado',
        });
      }

      return res.json({
        success: true,
        message: 'Datos bancarios actualizados correctamente',
      });
    } catch (error: any) {
      console.error('Error actualizando cuenta bancaria:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar datos bancarios',
        error: error.message,
      });
    }
  }
}