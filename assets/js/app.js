/* ===================================
   APP.JS - Aplicación Principal
   =================================== */

import { StorageManager } from './utils/storage.js';
import { DateUtils } from './utils/date-utils.js';
import { COURSES, COURSE_LEVELS, APP_CONFIG } from './config/constants.js';
import { DashboardController } from './components/dashboard.js';
import { StudentsController } from './components/students.js';
import { AttendanceController } from './components/attendance.js';
import { ReportsController } from './components/reports.js';

/**
 * Clase principal de la aplicación
 */
class AttendanceApp {
    
    constructor() {
        this.currentSection = 'dashboard';
        this.controllers = new Map();
        
        // Verificar soporte de localStorage
        if (!StorageManager.isAvailable()) {
            this.showAlert('LocalStorage no está disponible. Los datos no se guardarán.', 'warning');
        }
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.setupEventListeners();
        this.initializeControllers();
        this.updateCurrentDate();
        this.showSection('dashboard');
        
        // Actualizar fecha cada minuto
        setInterval(() => this.updateCurrentDate(), 60000);
        
        console.log(`${APP_CONFIG.NAME} v${APP_CONFIG.VERSION} initialized`);
    }

    /**
     * Configura event listeners globales
     */
    setupEventListeners() {
        // Navegación del sidebar
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Toggle menu mobile
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                menuToggle.classList.toggle('open');
                
                // Cambiar icono
                const icon = menuToggle.querySelector('i');
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                } else {
                    icon.className = 'fas fa-bars';
                }
            });
        }

        // Cerrar sidebar al hacer clic fuera (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar.contains(e.target) && 
                !menuToggle.contains(e.target) &&
                sidebar.classList.contains('open')) {
                
                sidebar.classList.remove('open');
                menuToggle.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // ESC para cerrar modales
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl+N para nuevo estudiante
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                if (this.currentSection === 'students') {
                    this.controllers.get('students').showAddModal();
                }
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('open');
                menuToggle.classList.remove('open');
                menuToggle.querySelector('i').className = 'fas fa-bars';
            }
        });

        // Quick attendance button
        const quickAttendanceBtn = document.getElementById('quick-attendance');
        if (quickAttendanceBtn) {
            quickAttendanceBtn.addEventListener('click', () => {
                if (this.controllers.has('attendance')) {
                    this.controllers.get('attendance').showAttendanceModal();
                }
            });
        }
    }

    /**
     * Inicializa controladores
     */
    initializeControllers() {
        // Dashboard
        this.controllers.set('dashboard', new DashboardController());
        
        // Students
        this.controllers.set('students', new StudentsController());
        
        // Attendance
        this.controllers.set('attendance', new AttendanceController());
        
        // Reports
        this.controllers.set('reports', new ReportsController());
        
        // Configurar comunicación entre controladores
        this.setupControllerCommunication();
    }

    /**
     * Configura comunicación entre controladores
     */
    setupControllerCommunication() {
        // Eventos personalizados para comunicación
        document.addEventListener('student-added', () => {
            this.controllers.get('dashboard').updateStats();
        });

        document.addEventListener('student-updated', () => {
            this.controllers.get('dashboard').updateStats();
        });

        document.addEventListener('student-deleted', () => {
            this.controllers.get('dashboard').updateStats();
        });

        document.addEventListener('attendance-marked', () => {
            this.controllers.get('dashboard').updateStats();
            this.controllers.get('dashboard').updateRecentActivity();
        });
    }

    /**
     * Muestra una sección específica
     * @param {string} sectionName - Nombre de la sección
     */
    showSection(sectionName) {
        // Validar sección
        const validSections = ['dashboard', 'students', 'attendance', 'reports'];
        if (!validSections.includes(sectionName)) {
            console.error(`Invalid section: ${sectionName}`);
            return;
        }

        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar sección activa
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Actualizar navegación
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
            
            if (item.dataset.section === sectionName) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            }
        });

        // Actualizar título
        const titles = {
            dashboard: 'Dashboard',
            students: 'Gestión de Estudiantes',
            attendance: 'Control de Asistencias',
            reports: 'Reportes y Estadísticas'
        };

        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'Academia';
        }

        // Actualizar URL sin recargar
        const url = new URL(window.location);
        url.hash = sectionName;
        window.history.pushState({}, '', url);

        // Actualizar sección actual
        this.currentSection = sectionName;

        // Inicializar controlador de la sección
        if (this.controllers.has(sectionName)) {
            this.controllers.get(sectionName).onSectionShow();
        }
    }

    /**
     * Actualiza la fecha actual en el header
     */
    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            const currentDate = DateUtils.getCurrentDateFormatted();
            dateElement.textContent = currentDate;
            dateElement.setAttribute('datetime', DateUtils.formatDateForInput(new Date()));
        }
    }

    /**
     * Muestra una alerta
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta (success, warning, danger, info)
     */
    showAlert(message, type = 'info') {
        // Crear elemento de alerta
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Agregar al DOM
        const container = document.querySelector('.main-content');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 5000);
        }
    }

    /**
     * Obtiene el icono para el tipo de alerta
     * @param {string} type - Tipo de alerta
     * @returns {string} Clase del icono
     */
    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            danger: 'times-circle',
            info: 'info-circle'
        };
        
        return icons[type] || 'info-circle';
    }

    /**
     * Cierra todos los modales abiertos
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Maneja errores globales
     * @param {Error} error - Error ocurrido
     * @param {string} context - Contexto donde ocurrió el error
     */
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        this.showAlert(`Error: ${error.message}`, 'danger');
    }

    /**
     * Obtiene información de la aplicación
     * @returns {Object} Información de la app
     */
    getAppInfo() {
        return {
            name: APP_CONFIG.NAME,
            version: APP_CONFIG.VERSION,
            currentSection: this.currentSection,
            controllers: Array.from(this.controllers.keys()),
            storageUsage: StorageManager.getUsageInfo()
        };
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });

    // Inicializar aplicación
    try {
        window.app = new AttendanceApp();
        
        // Manejar navegación por URL
        const hash = window.location.hash.replace('#', '');
        if (hash && ['dashboard', 'students', 'attendance', 'reports'].includes(hash)) {
            window.app.showSection(hash);
        }
        
        // Manejar navegación del browser
        window.addEventListener('popstate', () => {
            const currentHash = window.location.hash.replace('#', '') || 'dashboard';
            window.app.showSection(currentHash);
        });
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Mostrar error al usuario
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Error de inicialización:</strong> No se pudo cargar la aplicación.
            <br>Por favor, recarga la página o contacta al soporte técnico.
        `;
        
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
});