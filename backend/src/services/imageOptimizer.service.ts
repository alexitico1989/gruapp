// backend/src/services/imageOptimizer.service.ts

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

interface OptimizeOptions {
  width?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

class ImageOptimizerService {
  /**
   * Optimizar imagen
   */
  async optimizeImage(
    inputPath: string,
    outputPath: string,
    options: OptimizeOptions = {}
  ): Promise<{ success: boolean; originalSize: number; optimizedSize: number; savings: string }> {
    try {
      // Configuración por defecto
      const {
        width = 800,        // Ancho máximo
        quality = 80,       // Calidad (0-100)
        format = 'jpeg',    // Formato de salida
      } = options;

      // Obtener tamaño original
      const stats = await fs.stat(inputPath);
      const originalSize = stats.size;

      // Procesar imagen con sharp
      let sharpInstance = sharp(inputPath);

      // Redimensionar manteniendo aspect ratio
      sharpInstance = sharpInstance.resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true, // No agrandar imágenes pequeñas
      });

      // Convertir a formato y comprimir
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      }

      // Guardar imagen optimizada
      await sharpInstance.toFile(outputPath);

      // Obtener tamaño optimizado
      const optimizedStats = await fs.stat(outputPath);
      const optimizedSize = optimizedStats.size;

      // Calcular ahorro
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      console.log(`✅ Imagen optimizada: ${originalSize} → ${optimizedSize} bytes (${savings}% ahorro)`);

      // Eliminar archivo original
      await fs.unlink(inputPath);

      return {
        success: true,
        originalSize,
        optimizedSize,
        savings: `${savings}%`,
      };
    } catch (error: any) {
      console.error('❌ Error optimizando imagen:', error);
      throw error;
    }
  }

  /**
   * Optimizar foto de gruero (800x800, JPEG 80%)
   */
  async optimizarFotoGruero(inputPath: string, outputPath: string) {
    return this.optimizeImage(inputPath, outputPath, {
      width: 800,
      quality: 80,
      format: 'jpeg',
    });
  }

  /**
   * Optimizar foto de grúa (1200x800, JPEG 85%)
   */
  async optimizarFotoGrua(inputPath: string, outputPath: string) {
    return this.optimizeImage(inputPath, outputPath, {
      width: 1200,
      quality: 85,
      format: 'jpeg',
    });
  }

  /**
   * Optimizar documento (1600x1200, JPEG 90% para legibilidad)
   */
  async optimizarDocumento(inputPath: string, outputPath: string) {
    return this.optimizeImage(inputPath, outputPath, {
      width: 1600,
      quality: 90,
      format: 'jpeg',
    });
  }

  /**
   * Crear thumbnail pequeño (200x200)
   */
  async crearThumbnail(inputPath: string, outputPath: string) {
    return this.optimizeImage(inputPath, outputPath, {
      width: 200,
      quality: 75,
      format: 'jpeg',
    });
  }
}

export default new ImageOptimizerService();