/**
 * Validador de RUT Chileno para Frontend
 */

export const rutValidator = {
  /**
   * Limpia el RUT removiendo puntos y guiones
   */
  limpiar: (rut: string): string => {
    return rut.replace(/[.-]/g, '');
  },

  /**
   * Formatea el RUT con puntos y guión en tiempo real
   * Ejemplo: 123456789 -> 12.345.678-9
   */
  formatear: (rut: string): string => {
    const rutLimpio = rutValidator.limpiar(rut);
    
    if (rutLimpio.length < 2) return rut;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);
    
    // Agregar puntos cada 3 dígitos desde el final
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${cuerpoFormateado}-${dv}`;
  },

  /**
   * Formatea mientras el usuario escribe
   */
  formatearInput: (value: string): string => {
    // Remover todo excepto números y K
    let limpio = value.replace(/[^0-9kK]/g, '');
    
    // Limitar a 9 caracteres (12345678K)
    if (limpio.length > 9) {
      limpio = limpio.slice(0, 9);
    }
    
    if (limpio.length === 0) return '';
    if (limpio.length === 1) return limpio;
    
    // Formatear
    return rutValidator.formatear(limpio);
  },

  /**
   * Calcula el dígito verificador
   */
  calcularDV: (rut: string): string => {
    const rutLimpio = rutValidator.limpiar(rut);
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
  },

  /**
   * Valida un RUT chileno
   */
  validar: (rut: string): boolean => {
    if (!rut || typeof rut !== 'string') return false;
    
    const rutLimpio = rutValidator.limpiar(rut.trim());
    
    // Debe tener entre 8 y 9 caracteres
    if (rutLimpio.length < 8 || rutLimpio.length > 9) return false;
    
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1).toUpperCase();
    
    // Validar formato
    if (!/^\d+$/.test(cuerpo)) return false;
    if (!/^[0-9K]$/.test(dv)) return false;
    
    // Calcular y comparar dígito verificador
    const dvCalculado = rutValidator.calcularDV(rutLimpio);
    
    return dv === dvCalculado;
  },

  /**
   * Mensaje de error personalizado
   */
  mensajeError: (rut: string): string => {
    if (!rut) return 'El RUT es requerido';
    
    const rutLimpio = rutValidator.limpiar(rut);
    
    if (rutLimpio.length < 8) return 'RUT muy corto';
    if (rutLimpio.length > 9) return 'RUT muy largo';
    if (!rutValidator.validar(rut)) return 'RUT inválido';
    
    return '';
  }
};