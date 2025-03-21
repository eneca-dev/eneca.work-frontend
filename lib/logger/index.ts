/**
 * Централизованный логгер для приложения
 * Позволяет контролировать вывод логов в зависимости от окружения
 */
export const logger = {
  /**
   * Информационные сообщения (только в development)
   */
  info: (module: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${module}] ${message}`, data !== undefined ? data : '');
    }
  },
  
  /**
   * Сообщения об ошибках (в любом окружении)
   */
  error: (module: string, message: string, error?: any) => {
    console.error(`[${module}] ${message}`, error !== undefined ? error : '');
  },
  
  /**
   * Предупреждения (в любом окружении)
   */
  warn: (module: string, message: string, data?: any) => {
    console.warn(`[${module}] ${message}`, data !== undefined ? data : '');
  },
  
  /**
   * Отладочные сообщения (только в development)
   */
  debug: (module: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${module}:DEBUG] ${message}`, data !== undefined ? data : '');
    }
  }
};

export default logger; 