/**
 * Validador de RUT Chileno
 * Formato válido: 12.345.678-9 o 12345678-9 o 123456789
 */

export class RutValidator {
  /**
   * Limpia el RUT removiendo puntos y guiones
   */
  static limpiar(rut: string): string {
    return rut.replace(/[.-]/g, '');
  }

  /**
   * Formatea el RUT con puntos y guión
   * Ejemplo: 12345678-9 -> 12.345.678-9
   */
  static formatear(rut: string): string {
    const rutLimpio = this.limpiar(rut);
    
    if (rutLimpio.length < 2) return rut;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Agregar puntos cada 3 dígitos desde el final
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${cuerpoFormateado}-${dv}`;
  }

  /**
   * Calcula el dígito verificador de un RUT
   */
  static calcularDV(rut: string): string {
    const rutLimpio = this.limpiar(rut);
    const cuerpo = rutLimpio.slice(0, -1);
    
    let suma = 0;
    let multiplicador = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }
    
    const resto = suma % 11;
    const dvCalculado = 11 - resto;
    
    if (dvCalculado === 11) return '0';
    if (dvCalculado === 10) return 'K';
    return dvCalculado.toString();
  }

  /**
   * Valida un RUT chileno
   * @param rut - RUT a validar (puede tener puntos y guión)
   * @returns true si el RUT es válido, false en caso contrario
   */
  static validar(rut: string): boolean {
    if (!rut || typeof rut !== 'string') return false;
    
    const rutLimpio = this.limpiar(rut.trim());
    
    // Validar formato: debe tener entre 8 y 9 caracteres (7-8 dígitos + 1 dígito verificador)
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    
    // Validar que todos sean números excepto el último que puede ser K
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    if (!/^\d+$/.test(cuerpo)) return false;
    if (!/^[0-9K]$/.test(dv)) return false;
    
    // Calcular y comparar dígito verificador
    const dvCalculado = this.calcularDV(rutLimpio);
    
    return dv === dvCalculado;
  }

  /**
   * Valida y formatea un RUT
   * @param rut - RUT a validar y formatear
   * @returns RUT formateado si es válido, null si es inválido
   */
  static validarYFormatear(rut: string): string | null {
    if (!this.validar(rut)) return null;
    return this.formatear(rut);
  }
}