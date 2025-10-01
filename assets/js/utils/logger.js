// Utilidad de logging que solo funciona en desarrollo
class Logger {
    constructor() {
        this.isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.port !== '';
    }
    
    log(...args) {
        if (this.isDevelopment && console.log) {
            console.log(...args);
        }
    }
    
    warn(...args) {
        if (this.isDevelopment && console.warn) {
            console.warn(...args);
        }
    }
    
    error(...args) {
        if (this.isDevelopment && console.error) {
            console.error(...args);
        }
    }
    
    info(...args) {
        if (this.isDevelopment && console.info) {
            console.info(...args);
        }
    }
    
    debug(...args) {
        if (this.isDevelopment && console.debug) {
            console.debug(...args);
        }
    }
    
    group(label) {
        if (this.isDevelopment && console.group) {
            console.group(label);
        }
    }
    
    groupEnd() {
        if (this.isDevelopment && console.groupEnd) {
            console.groupEnd();
        }
    }
    
    table(data) {
        if (this.isDevelopment && console.table) {
            console.table(data);
        }
    }
}

// Instancia global del logger
window.logger = new Logger();

// Exportar para uso como módulo
export { Logger };
export default window.logger;