/* ===================================
   VALIDATORS.JS - Sistema de Validaciones
   =================================== */

import { VALIDATION_RULES, MESSAGES } from '../config/constants.js';

/**
 * Sistema de validaciones para formularios
 */
export class Validators {
    
    /**
     * Valida que un campo no esté vacío
     * @param {string} value - Valor a validar
     * @returns {Object} Resultado de la validación
     */
    static required(value) {
        const isValid = value !== null && value !== undefined && value.trim() !== '';
        return {
            isValid,
            message: isValid ? '' : MESSAGES.ERROR.REQUIRED_FIELD
        };
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {Object} Resultado de la validación
     */
    static email(email) {
        if (!email || email.trim() === '') {
            return { isValid: true, message: '' }; // Campo opcional
        }
        
        const isValid = VALIDATION_RULES.EMAIL_REGEX.test(email.trim());
        return {
            isValid,
            message: isValid ? '' : MESSAGES.ERROR.INVALID_EMAIL
        };
    }

    /**
     * Valida formato de teléfono
     * @param {string} phone - Teléfono a validar
     * @returns {Object} Resultado de la validación
     */
    static phone(phone) {
        if (!phone || phone.trim() === '') {
            return { isValid: true, message: '' }; // Campo opcional
        }
        
        const isValid = VALIDATION_RULES.PHONE_REGEX.test(phone.trim());
        return {
            isValid,
            message: isValid ? '' : MESSAGES.ERROR.INVALID_PHONE
        };
    }

    /**
     * Valida longitud mínima
     * @param {string} value - Valor a validar
     * @param {number} minLength - Longitud mínima
     * @returns {Object} Resultado de la validación
     */
    static minLength(value, minLength) {
        if (!value) {
            return { isValid: false, message: MESSAGES.ERROR.REQUIRED_FIELD };
        }
        
        const isValid = value.trim().length >= minLength;
        return {
            isValid,
            message: isValid ? '' : `Mínimo ${minLength} caracteres`
        };
    }

    /**
     * Valida longitud máxima
     * @param {string} value - Valor a validar
     * @param {number} maxLength - Longitud máxima
     * @returns {Object} Resultado de la validación
     */
    static maxLength(value, maxLength) {
        if (!value) {
            return { isValid: true, message: '' };
        }
        
        const isValid = value.trim().length <= maxLength;
        return {
            isValid,
            message: isValid ? '' : `Máximo ${maxLength} caracteres`
        };
    }

    /**
     * Valida que un valor esté dentro de opciones válidas
     * @param {string} value - Valor a validar
     * @param {Array} options - Opciones válidas
     * @returns {Object} Resultado de la validación
     */
    static oneOf(value, options) {
        const isValid = options.includes(value);
        return {
            isValid,
            message: isValid ? '' : 'Opción no válida'
        };
    }

    /**
     * Valida fecha
     * @param {string} date - Fecha a validar
     * @returns {Object} Resultado de la validación
     */
    static date(date) {
        if (!date || date.trim() === '') {
            return { isValid: false, message: 'Fecha requerida' };
        }
        
        const dateObj = new Date(date);
        const isValid = dateObj instanceof Date && !isNaN(dateObj);
        return {
            isValid,
            message: isValid ? '' : 'Fecha no válida'
        };
    }

    /**
     * Valida que una fecha no sea futura
     * @param {string} date - Fecha a validar
     * @returns {Object} Resultado de la validación
     */
    static pastDate(date) {
        const dateValidation = this.date(date);
        if (!dateValidation.isValid) {
            return dateValidation;
        }
        
        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Final del día
        
        const isValid = dateObj <= today;
        return {
            isValid,
            message: isValid ? '' : 'La fecha no puede ser futura'
        };
    }

    /**
     * Valida número
     * @param {string|number} value - Valor a validar
     * @returns {Object} Resultado de la validación
     */
    static number(value) {
        if (value === null || value === undefined || value === '') {
            return { isValid: false, message: 'Número requerido' };
        }
        
        const numValue = Number(value);
        const isValid = !isNaN(numValue) && isFinite(numValue);
        return {
            isValid,
            message: isValid ? '' : 'Debe ser un número válido'
        };
    }

    /**
     * Valida rango numérico
     * @param {string|number} value - Valor a validar
     * @param {number} min - Valor mínimo
     * @param {number} max - Valor máximo
     * @returns {Object} Resultado de la validación
     */
    static range(value, min, max) {
        const numberValidation = this.number(value);
        if (!numberValidation.isValid) {
            return numberValidation;
        }
        
        const numValue = Number(value);
        const isValid = numValue >= min && numValue <= max;
        return {
            isValid,
            message: isValid ? '' : `Debe estar entre ${min} y ${max}`
        };
    }
}

/**
 * Validador de formularios
 */
export class FormValidator {
    
    constructor() {
        this.rules = new Map();
        this.errors = new Map();
    }

    /**
     * Agrega una regla de validación
     * @param {string} fieldName - Nombre del campo
     * @param {Array} validationRules - Reglas de validación
     */
    addRule(fieldName, validationRules) {
        this.rules.set(fieldName, validationRules);
    }

    /**
     * Valida un formulario
     * @param {Object} formData - Datos del formulario
     * @returns {Object} Resultado de la validación
     */
    validate(formData) {
        this.errors.clear();
        let isValid = true;

        for (const [fieldName, rules] of this.rules) {
            const fieldValue = formData[fieldName];
            
            for (const rule of rules) {
                const result = rule(fieldValue);
                if (!result.isValid) {
                    this.errors.set(fieldName, result.message);
                    isValid = false;
                    break; // Solo mostrar el primer error por campo
                }
            }
        }

        return {
            isValid,
            errors: Object.fromEntries(this.errors)
        };
    }

    /**
     * Obtiene errores de un campo específico
     * @param {string} fieldName - Nombre del campo
     * @returns {string} Mensaje de error
     */
    getError(fieldName) {
        return this.errors.get(fieldName) || '';
    }

    /**
     * Verifica si un campo tiene errores
     * @param {string} fieldName - Nombre del campo
     * @returns {boolean} True si tiene errores
     */
    hasError(fieldName) {
        return this.errors.has(fieldName);
    }

    /**
     * Limpia errores
     */
    clearErrors() {
        this.errors.clear();
    }

    /**
     * Limpia error de un campo específico
     * @param {string} fieldName - Nombre del campo
     */
    clearFieldError(fieldName) {
        this.errors.delete(fieldName);
    }
}

/**
 * Funciones de validación predefinidas para formularios comunes
 */
export const ValidationRules = {
    
    /**
     * Reglas para estudiante
     */
    student: {
        name: [
            (value) => Validators.required(value),
            (value) => Validators.minLength(value, VALIDATION_RULES.MIN_NAME_LENGTH),
            (value) => Validators.maxLength(value, VALIDATION_RULES.MAX_NAME_LENGTH)
        ],
        email: [
            (value) => Validators.required(value),
            (value) => Validators.email(value),
            (value) => Validators.maxLength(value, VALIDATION_RULES.MAX_EMAIL_LENGTH)
        ],
        phone: [
            (value) => Validators.required(value),
            (value) => Validators.phone(value)
        ],
        course: [
            (value) => Validators.required(value)
        ],
        level: [
            (value) => Validators.required(value)
        ],
        enrollmentDate: [
            (value) => Validators.required(value),
            (value) => Validators.date(value),
            (value) => Validators.pastDate(value)
        ]
    },

    /**
     * Reglas para asistencia
     */
    attendance: {
        studentId: [
            (value) => Validators.required(value),
            (value) => Validators.number(value)
        ],
        date: [
            (value) => Validators.required(value),
            (value) => Validators.date(value)
        ],
        status: [
            (value) => Validators.required(value)
        ]
    }
};