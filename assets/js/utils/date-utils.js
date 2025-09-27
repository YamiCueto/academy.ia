/* ===================================
   DATE-UTILS.JS - Utilidades de Fechas
   =================================== */

/**
 * Utilidades para manejo de fechas
 */
export class DateUtils {
    
    /**
     * Formatea una fecha en formato legible en español
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    static formatDate(date) {
        const d = new Date(date);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        
        return d.toLocaleDateString('es-ES', options);
    }

    /**
     * Formatea una fecha en formato corto
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha formateada (DD/MM/YYYY)
     */
    static formatDateShort(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        
        return `${day}/${month}/${year}`;
    }

    /**
     * Formatea una fecha para input HTML
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha en formato YYYY-MM-DD
     */
    static formatDateForInput(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * Formatea hora en formato 24h
     * @param {Date|string} date - Fecha/hora a formatear
     * @returns {string} Hora formateada (HH:MM)
     */
    static formatTime(date) {
        const d = new Date(date);
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        
        return `${hours}:${minutes}`;
    }

    /**
     * Obtiene la fecha actual formateada
     * @returns {string} Fecha actual formateada
     */
    static getCurrentDateFormatted() {
        return this.formatDate(new Date());
    }

    /**
     * Obtiene la fecha actual para input
     * @returns {string} Fecha actual en formato YYYY-MM-DD
     */
    static getCurrentDateForInput() {
        return this.formatDateForInput(new Date());
    }

    /**
     * Verifica si una fecha es válida
     * @param {string|Date} date - Fecha a verificar
     * @returns {boolean} True si es válida
     */
    static isValidDate(date) {
        const d = new Date(date);
        return d instanceof Date && !isNaN(d);
    }

    /**
     * Calcula la diferencia en días entre dos fechas
     * @param {Date|string} date1 - Primera fecha
     * @param {Date|string} date2 - Segunda fecha
     * @returns {number} Diferencia en días
     */
    static daysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const timeDiff = Math.abs(d2.getTime() - d1.getTime());
        
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * Obtiene el primer día de la semana actual
     * @param {Date} date - Fecha de referencia
     * @returns {Date} Primer día de la semana
     */
    static getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
        
        return new Date(d.setDate(diff));
    }

    /**
     * Obtiene el último día de la semana actual
     * @param {Date} date - Fecha de referencia
     * @returns {Date} Último día de la semana
     */
    static getWeekEnd(date = new Date()) {
        const weekStart = this.getWeekStart(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        return weekEnd;
    }

    /**
     * Obtiene el primer día del mes
     * @param {Date} date - Fecha de referencia
     * @returns {Date} Primer día del mes
     */
    static getMonthStart(date = new Date()) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    /**
     * Obtiene el último día del mes
     * @param {Date} date - Fecha de referencia
     * @returns {Date} Último día del mes
     */
    static getMonthEnd(date = new Date()) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0);
    }

    /**
     * Obtiene una lista de fechas en un rango
     * @param {Date|string} startDate - Fecha de inicio
     * @param {Date|string} endDate - Fecha de fin
     * @returns {Array<Date>} Array de fechas
     */
    static getDateRange(startDate, endDate) {
        const dates = [];
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        while (start <= end) {
            dates.push(new Date(start));
            start.setDate(start.getDate() + 1);
        }
        
        return dates;
    }

    /**
     * Verifica si una fecha es hoy
     * @param {Date|string} date - Fecha a verificar
     * @returns {boolean} True si es hoy
     */
    static isToday(date) {
        const d = new Date(date);
        const today = new Date();
        
        return d.toDateString() === today.toDateString();
    }

    /**
     * Verifica si una fecha es esta semana
     * @param {Date|string} date - Fecha a verificar
     * @returns {boolean} True si es esta semana
     */
    static isThisWeek(date) {
        const d = new Date(date);
        const weekStart = this.getWeekStart();
        const weekEnd = this.getWeekEnd();
        
        return d >= weekStart && d <= weekEnd;
    }

    /**
     * Verifica si una fecha es este mes
     * @param {Date|string} date - Fecha a verificar
     * @returns {boolean} True si es este mes
     */
    static isThisMonth(date) {
        const d = new Date(date);
        const today = new Date();
        
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }

    /**
     * Obtiene el nombre del día de la semana
     * @param {Date|string} date - Fecha
     * @returns {string} Nombre del día
     */
    static getDayName(date) {
        const d = new Date(date);
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        return days[d.getDay()];
    }

    /**
     * Obtiene el nombre del mes
     * @param {Date|string} date - Fecha
     * @returns {string} Nombre del mes
     */
    static getMonthName(date) {
        const d = new Date(date);
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return months[d.getMonth()];
    }

    /**
     * Convierte tiempo relativo (hace X días)
     * @param {Date|string} date - Fecha
     * @returns {string} Tiempo relativo
     */
    static getRelativeTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        
        return 'Hace un momento';
    }
}