import { config } from '../config';
import { PricingCalculation } from '../types';

export class PricingService {
  /**
   * Calcula el precio total del servicio basado en la distancia
   * @param distanciaKm - Distancia en kilómetros
   * @returns Objeto con todos los cálculos de pricing
   */
  static calculatePricing(distanciaKm: number): PricingCalculation {
    const { baseFare, pricePerKm, platformCommission, mpCommission } = config.pricing;
    
    // Cálculos base
    const tarifaBase = baseFare;
    const tarifaDistancia = distanciaKm * pricePerKm;
    const subtotal = tarifaBase + tarifaDistancia;
    
    // Lo que paga el cliente
    const totalCliente = Math.round(subtotal);
    
    // Comisión de Mercado Pago (sobre el total)
    const comisionMP = Math.round(totalCliente * mpCommission);
    
    // Comisión de la plataforma (15% sobre el total)
    const comisionPlataforma = Math.round(totalCliente * platformCommission);
    
    // Lo que recibe el gruero (total - ambas comisiones)
    const totalGruero = totalCliente - comisionMP - comisionPlataforma;
    
    return {
      distanciaKm: Math.round(distanciaKm * 100) / 100, // 2 decimales
      tarifaBase,
      tarifaDistancia: Math.round(tarifaDistancia),
      subtotal: Math.round(subtotal),
      comisionPlataforma,
      comisionMP,
      totalCliente,
      totalGruero,
    };
  }
  
  /**
   * Calcula solo el precio estimado para mostrar al cliente
   * @param distanciaKm - Distancia en kilómetros
   * @returns Precio total que pagará el cliente
   */
  static estimatePrice(distanciaKm: number): number {
    const { baseFare, pricePerKm } = config.pricing;
    return Math.round(baseFare + (distanciaKm * pricePerKm));
  }
  
  /**
   * Calcula cuánto recibirá el gruero después de comisiones
   * @param totalCliente - Total que paga el cliente
   * @returns Monto que recibe el gruero
   */
  static calculateGrueroEarnings(totalCliente: number): number {
    const { platformCommission, mpCommission } = config.pricing;
    const comisionMP = Math.round(totalCliente * mpCommission);
    const comisionPlataforma = Math.round(totalCliente * platformCommission);
    return totalCliente - comisionMP - comisionPlataforma;
  }
}