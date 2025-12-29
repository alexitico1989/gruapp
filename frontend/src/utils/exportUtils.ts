import Papa from 'papaparse';

/**
 * Exportar datos a CSV
 */
export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exportar transacciones financieras a CSV
 */
export const exportTransaccionesCSV = (transacciones: any[]) => {
  const datos = transacciones.map(t => ({
    'Fecha': new Date(t.completadoAt).toLocaleDateString('es-CL'),
    'Cliente': `${t.cliente.user.nombre} ${t.cliente.user.apellido}`,
    'Gruero': t.gruero ? `${t.gruero.user.nombre} ${t.gruero.user.apellido}` : 'N/A',
    'Patente': t.gruero?.patente || 'N/A',
    'Tipo Vehículo': t.tipoVehiculo,
    'Distancia (km)': t.distanciaKm,
    'Total Cliente': t.totalCliente,
    'Pago Gruero': t.totalGruero,
    'Comisión Plataforma': t.comisionPlataforma,
    'Comisión MP': t.comisionMP,
    'ID Pago MP': t.mpPaymentId || 'N/A',
  }));
  
  exportToCSV(datos, 'transacciones_gruapp');
};

/**
 * Exportar métricas generales a CSV
 */
export const exportMetricasCSV = (metricas: any) => {
  const datos = [
    { 'Métrica': 'Ingresos Totales', 'Valor': metricas.ingresosTotal },
    { 'Métrica': 'Facturación Total', 'Valor': metricas.facturacionTotal },
    { 'Métrica': 'Pago Grueros Total', 'Valor': metricas.pagoGruerosTotal },
    { 'Métrica': 'Ingresos Mes Actual', 'Valor': metricas.ingresosMesActual },
    { 'Métrica': 'Facturación Mes Actual', 'Valor': metricas.facturacionMesActual },
    { 'Métrica': 'Pago Grueros Mes Actual', 'Valor': metricas.pagoGruerosMesActual },
    { 'Métrica': 'Ingresos Mes Anterior', 'Valor': metricas.ingresosMesAnterior },
    { 'Métrica': 'Cambio Mensual (%)', 'Valor': metricas.cambioMensual },
    { 'Métrica': 'Servicios Completados Mes', 'Valor': metricas.serviciosCompletadosMes },
    { 'Métrica': 'Servicios Totales Mes', 'Valor': metricas.serviciosTotalesMes },
    { 'Métrica': 'Tasa de Conversión (%)', 'Valor': metricas.tasaConversion },
    { 'Métrica': 'Comisión Promedio', 'Valor': metricas.comisionPromedio },
    { 'Métrica': 'Proyección Mensual', 'Valor': metricas.proyeccionMensual },
  ];
  
  exportToCSV(datos, 'metricas_gruapp');
};

/**
 * Exportar Top Grueros a CSV
 */
export const exportGruerosCSV = (grueros: any[]) => {
  const datos = grueros.map(g => ({
    'Nombre': g.nombre,
    'Patente': g.patente,
    'Marca': g.marca,
    'Modelo': g.modelo,
    'Servicios Completados': g.serviciosCompletados,
    'Total Ganado': g.totalGanado,
    'Comisión Generada': g.comisionGenerada,
    'Facturación Total': g.facturacionTotal,
    'Promedio por Servicio': g.promedioServicio,
  }));
  
  exportToCSV(datos, 'top_grueros_gruapp');
};

/**
 * Exportar Ingresos por Vehículo a CSV
 */
export const exportVehiculosCSV = (vehiculos: any[]) => {
  const datos = vehiculos.map(v => ({
    'Tipo Vehículo': v.tipoVehiculo,
    'Servicios': v.servicios,
    'Comisión Total': v.comisionTotal,
    'Facturación Total': v.facturacionTotal,
    'Pago Grueros Total': v.pagoGruerosTotal,
    'Comisión Promedio': v.comisionPromedio,
    'Facturación Promedio': v.facturacionPromedio,
  }));
  
  exportToCSV(datos, 'ingresos_por_vehiculo_gruapp');
};

/**
 * Exportar Ingresos Diarios a CSV
 */
export const exportIngresosDiariosCSV = (ingresos: any[]) => {
  const datos = ingresos.map(i => ({
    'Fecha': i.fecha,
    'Comisión Plataforma': i.comisionPlataforma,
    'Facturación': i.facturacion,
    'Pago Grueros': i.pagoGrueros,
    'Servicios': i.servicios,
  }));
  
  exportToCSV(datos, 'ingresos_diarios_gruapp');
};

/**
 * Exportar reporte completo (todas las secciones)
 */
export const exportReporteCompleto = (data: {
  metricas: any;
  transacciones: any[];
  grueros: any[];
  vehiculos: any[];
  ingresosDiarios: any[];
}) => {
  // Para un reporte completo, mejor usar Excel con múltiples hojas
  // Por ahora, exportamos cada sección por separado
  exportMetricasCSV(data.metricas);
  
  setTimeout(() => {
    exportTransaccionesCSV(data.transacciones);
  }, 300);
  
  setTimeout(() => {
    exportGruerosCSV(data.grueros);
  }, 600);
  
  setTimeout(() => {
    exportVehiculosCSV(data.vehiculos);
  }, 900);
  
  setTimeout(() => {
    exportIngresosDiariosCSV(data.ingresosDiarios);
  }, 1200);
};