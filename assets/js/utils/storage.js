/* ===================================
   STORAGE.JS - LocalStorage Helper
   =================================== */

import { STORAGE_KEYS, SAMPLE_STUDENTS } from '../config/constants.js';

/**
 * Clase para manejar el almacenamiento local
 */
export class StorageManager {
    
    /**
     * Obtiene datos del localStorage
     * @param {string} key - Clave de almacenamiento
     * @param {any} defaultValue - Valor por defecto si no existe
     * @returns {any} Datos almacenados o valor por defecto
     */
    static get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error getting data from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    /**
     * Guarda datos en localStorage
     * @param {string} key - Clave de almacenamiento
     * @param {any} data - Datos a guardar
     * @returns {boolean} True si se guardó exitosamente
     */
    static set(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving data to localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Elimina datos del localStorage
     * @param {string} key - Clave de almacenamiento
     * @returns {boolean} True si se eliminó exitosamente
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing data from localStorage (${key}):`, error);
            return false;
        }
    }

    /**
     * Limpia todo el localStorage de la aplicación
     */
    static clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    /**
     * Obtiene estudiantes del localStorage
     * @returns {Array} Lista de estudiantes
     */
    static getStudents() {
        const students = this.get(STORAGE_KEYS.STUDENTS, []);
        
        // Si no hay estudiantes, cargar datos de ejemplo
        if (students.length === 0) {
            this.set(STORAGE_KEYS.STUDENTS, SAMPLE_STUDENTS);
            return SAMPLE_STUDENTS;
        }
        
        return students;
    }

    /**
     * Guarda estudiantes en localStorage
     * @param {Array} students - Lista de estudiantes
     * @returns {boolean} True si se guardó exitosamente
     */
    static saveStudents(students) {
        return this.set(STORAGE_KEYS.STUDENTS, students);
    }

    /**
     * Obtiene asistencias del localStorage
     * @returns {Array} Lista de asistencias
     */
    static getAttendance() {
        return this.get(STORAGE_KEYS.ATTENDANCE, []);
    }

    /**
     * Guarda asistencias en localStorage
     * @param {Array} attendance - Lista de asistencias
     * @returns {boolean} True si se guardó exitosamente
     */
    static saveAttendance(attendance) {
        return this.set(STORAGE_KEYS.ATTENDANCE, attendance);
    }

    /**
     * Obtiene configuración de la app
     * @returns {Object} Configuración de la aplicación
     */
    static getSettings() {
        return this.get(STORAGE_KEYS.SETTINGS, {
            theme: 'light',
            language: 'es',
            pageSize: 10
        });
    }

    /**
     * Guarda configuración de la app
     * @param {Object} settings - Configuración
     * @returns {boolean} True si se guardó exitosamente
     */
    static saveSettings(settings) {
        return this.set(STORAGE_KEYS.SETTINGS, settings);
    }

    /**
     * Exporta todos los datos a un objeto
     * @returns {Object} Todos los datos de la aplicación
     */
    static exportData() {
        return {
            students: this.getStudents(),
            attendance: this.getAttendance(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    /**
     * Importa datos desde un objeto
     * @param {Object} data - Datos a importar
     * @returns {boolean} True si se importó exitosamente
     */
    static importData(data) {
        try {
            if (data.students) {
                this.saveStudents(data.students);
            }
            if (data.attendance) {
                this.saveAttendance(data.attendance);
            }
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Verifica si localStorage está disponible
     * @returns {boolean} True si localStorage está disponible
     */
    static isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.warn('localStorage not available:', error);
            return false;
        }
    }

    /**
     * Obtiene información de uso del localStorage
     * @returns {Object} Información de uso
     */
    static getUsageInfo() {
        if (!this.isAvailable()) {
            return { available: false };
        }

        let totalSize = 0;
        let itemCount = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
                itemCount++;
            }
        }

        return {
            available: true,
            totalSize: totalSize,
            itemCount: itemCount,
            formattedSize: this.formatBytes(totalSize)
        };
    }

    /**
     * Formatea bytes en unidades legibles
     * @param {number} bytes - Cantidad de bytes
     * @returns {string} Tamaño formateado
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}