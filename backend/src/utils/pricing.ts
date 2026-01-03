import { config } from '../config';
import { PricingCalculation } from '../types';

export class PricingService {
  // Tarifas para vehículos PESADOS (sobrescriben las del config)
  private static readonly TARIFA_BASE_PESADO = 60000;
  private static readonly TARIFA_POR_KM_PESADO = 1850;

  /**
   * Calcula el precio total del servicio basado en la distancia (VEHÍCULOS LIVIANOS)
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
   * Calcula el precio total del servicio para VEHÍCULOS PESADOS
   * (Camión Mediano, Camión Pesado, Bus, Maquinaria)
   * @param distanciaKm - Distancia en kilómetros
   * @returns Objeto con todos los cálculos de pricing
   */
  static calculatePricingPesado(distanciaKm: number): PricingCalculation {
    const { platformCommission, mpCommission } = config.pricing;
    
    // Tarifas especiales para vehículos pesados
    const tarifaBase = this.TARIFA_BASE_PESADO;
    const tarifaDistancia = distanciaKm * this.TARIFA_POR_KM_PESADO;
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
   * Calcula pricing automáticamente según el tipo de vehículo
   * @param distanciaKm - Distancia en kilómetros
   * @param tipoVehiculo - Tipo de vehículo (AUTOMOVIL, CAMIONETA, PESADO, BUS, etc.)
   * @returns Objeto con todos los cálculos de pricing
   */
  static calculatePricingByType(distanciaKm: number, tipoVehiculo: string): PricingCalculation {
    const vehiculosPesados = ['MEDIANO', 'PESADO', 'BUS', 'MAQUINARIA'];
    const esPesado = vehiculosPesados.includes(tipoVehiculo);
    
    return esPesado 
      ? this.calculatePricingPesado(distanciaKm)
      : this.calculatePricing(distanciaKm);
  }
  
  /**
   * Calcula solo el precio estimado para mostrar al cliente (LIVIANOS)
   * @param distanciaKm - Distancia en kilómetros
   * @returns Precio total que pagará el cliente
   */
  static estimatePrice(distanciaKm: number): number {
    const { baseFare, pricePerKm } = config.pricing;
    return Math.round(baseFare + (distanciaKm * pricePerKm));
  }

  /**
   * Calcula solo el precio estimado para vehículos PESADOS
   * @param distanciaKm - Distancia en kilómetros
   * @returns Precio total que pagará el cliente
   */
  static estimatePricePesado(distanciaKm: number): number {
    return Math.round(this.TARIFA_BASE_PESADO + (distanciaKm * this.TARIFA_POR_KM_PESADO));
  }

  /**
   * Calcula precio estimado según tipo de vehículo
   * @param distanciaKm - Distancia en kilómetros
   * @param tipoVehiculo - Tipo de vehículo
   * @returns Precio total que pagará el cliente
   */
  static estimatePriceByType(distanciaKm: number, tipoVehiculo: string): number {
    const vehiculosPesados = ['MEDIANO', 'PESADO', 'BUS', 'MAQUINARIA'];
    const esPesado = vehiculosPesados.includes(tipoVehiculo);
    
    return esPesado
      ? this.estimatePricePesado(distanciaKm)
      : this.estimatePrice(distanciaKm);
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