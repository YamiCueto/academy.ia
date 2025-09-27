/* ===================================
   CONSTANTS.JS - Constantes de la App
   =================================== */

// Configuración de cursos
export const COURSES = {
    'ingles-basico': 'Inglés Básico',
    'ingles-intermedio': 'Inglés Intermedio',
    'ingles-avanzado': 'Inglés Avanzado',
    'ingles-conversacion': 'Inglés Conversación',
    'toefl-prep': 'Preparación TOEFL'
};

export const COURSE_LEVELS = {
    'ingles-basico': ['A1', 'A2'],
    'ingles-intermedio': ['B1', 'B2'],
    'ingles-avanzado': ['C1', 'C2'],
    'ingles-conversacion': ['B1', 'B2', 'C1', 'C2'],
    'toefl-prep': ['TOEFL']
};

// Estados de asistencia
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    ABSENT: 'absent',
    LATE: 'late',
    EXCUSED: 'excused'
};

export const ATTENDANCE_LABELS = {
    [ATTENDANCE_STATUS.PRESENT]: 'Presente',
    [ATTENDANCE_STATUS.ABSENT]: 'Ausente',
    [ATTENDANCE_STATUS.LATE]: 'Tardanza',
    [ATTENDANCE_STATUS.EXCUSED]: 'Justificado'
};

// Configuración de LocalStorage
export const STORAGE_KEYS = {
    STUDENTS: 'students',
    ATTENDANCE: 'attendance',
    SETTINGS: 'app_settings'
};

// Configuración de la aplicación
export const APP_CONFIG = {
    NAME: 'Academia de Idiomas',
    VERSION: '1.0.0',
    DEFAULT_PAGE_SIZE: 10,
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm'
};

// Configuración de validaciones
export const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\+?[\d\s-()]{10,}$/,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 255
};

// Mensajes de la aplicación
export const MESSAGES = {
    SUCCESS: {
        STUDENT_ADDED: 'Estudiante agregado exitosamente',
        STUDENT_UPDATED: 'Estudiante actualizado exitosamente',
        STUDENT_DELETED: 'Estudiante eliminado exitosamente',
        ATTENDANCE_MARKED: 'Asistencia marcada exitosamente',
        DATA_EXPORTED: 'Datos exportados exitosamente'
    },
    ERROR: {
        GENERIC: 'Ha ocurrido un error inesperado',
        INVALID_EMAIL: 'El email no tiene un formato válido',
        INVALID_PHONE: 'El teléfono no tiene un formato válido',
        REQUIRED_FIELD: 'Este campo es obligatorio',
        STUDENT_NOT_FOUND: 'Estudiante no encontrado',
        DUPLICATE_EMAIL: 'Ya existe un estudiante con este email'
    },
    CONFIRM: {
        DELETE_STUDENT: '¿Estás seguro de eliminar este estudiante?',
        CLEAR_DATA: '¿Estás seguro de limpiar todos los datos?'
    }
};

// Configuración de reportes
export const REPORT_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    COURSE: 'course',
    STUDENT: 'student'
};

export const CHART_COLORS = {
    PRIMARY: '#6366f1',
    SECONDARY: '#8b5cf6',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    DANGER: '#ef4444',
    INFO: '#06b6d4'
};

// Datos de ejemplo para desarrollo
export const SAMPLE_STUDENTS = [
    {
        id: 1,
        name: 'Ana García',
        email: 'ana.garcia@email.com',
        phone: '+57 300 123 4567',
        course: 'ingles-intermedio',
        level: 'B1',
        enrollmentDate: '2024-01-15'
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+57 301 234 5678',
        course: 'ingles-basico',
        level: 'A2',
        enrollmentDate: '2024-01-20'
    },
    {
        id: 3,
        name: 'María López',
        email: 'maria.lopez@email.com',
        phone: '+57 302 345 6789',
        course: 'ingles-avanzado',
        level: 'C1',
        enrollmentDate: '2024-01-10'
    },
    {
        id: 4,
        name: 'Luis Martínez',
        email: 'luis.martinez@email.com',
        phone: '+57 303 456 7890',
        course: 'toefl-prep',
        level: 'TOEFL',
        enrollmentDate: '2024-01-25'
    },
    {
        id: 5,
        name: 'Carmen Silva',
        email: 'carmen.silva@email.com',
        phone: '+57 304 567 8901',
        course: 'ingles-conversacion',
        level: 'B2',
        enrollmentDate: '2024-02-01'
    }
];

// Configuración de animaciones
export const ANIMATION_CONFIG = {
    DURATION: {
        SHORT: 200,
        MEDIUM: 300,
        LONG: 500
    },
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
};