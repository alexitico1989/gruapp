// frontend/src/utils/logger.ts

const isDevelopment = import.meta.env.DEV;

class Logger {
  log(...args: any[]) {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: any[]) {
    // Errors siempre se muestran (para debugging crítico)
    console.error(...args);
  }

  warn(...args: any[]) {
    if (isDevelopment) {
      console.warn(...args);
    }
  }

  info(...args: any[]) {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args: any[]) {
    if (isDevelopment) {
      console.debug(...args);
    }
  }
}

export const logger = new Logger();