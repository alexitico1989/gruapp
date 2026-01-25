export const rutValidator = {
  /**
   * Formatea el RUT para mostrarlo con puntos y guión: 12.345.678-9
   */
  formatearInput: (rut: string) => {
    // Elimina todo lo que no sea número o K/k
    let valor = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // Aplica formato: 12.345.678-K
    if (valor.length > 1) {
      const cuerpo = valor.slice(0, -1);
      const dv = valor.slice(-1);
      const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `${cuerpoFormateado}-${dv}`;
    }
    
    return valor;
  },

  /**
   * Valida si un RUT es válido (acepta con o sin formato)
   */
  validar: (rut: string) => {
    if (!rut) return false;

    // Limpiar el RUT (quitar puntos, espacios y guión)
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();

    if (rutLimpio.length < 2) return false;

    // Separar cuerpo y dígito verificador
    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    // Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(cuerpo)) return false;

    // Validar que el DV sea número o K
    if (!/^[0-9K]$/.test(dv)) return false;

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperado = 11 - (suma % 11);
    let dvCalculado: string;

    if (dvEsperado === 11) {
      dvCalculado = '0';
    } else if (dvEsperado === 10) {
      dvCalculado = 'K';
    } else {
      dvCalculado = dvEsperado.toString();
    }

    return dv === dvCalculado;
  },

  /**
   * Mensaje de error personalizado
   */
  mensajeError: (rut: string) => {
    if (!rut) return 'El RUT es requerido';
    if (rut.length < 2) return 'RUT demasiado corto';
    return 'RUT inválido. Verifica el número y dígito verificador';
  },

  /**
   * Limpia el RUT dejando solo números y K
   */
  limpiar: (rut: string) => {
    return rut.replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
  },
};