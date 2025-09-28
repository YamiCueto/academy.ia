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
import { CoursesController } from './components/courses.js';
import { InstructorsController } from './components/instructors.js';

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
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                menuToggle.classList.toggle('open');
                
                // Cambiar icono
                const icon = menuToggle.querySelector('i');
                if (sidebar.classList.contains('open')) {
                    icon.className = 'fas fa-times';
                    document.body.style.overflow = 'hidden'; // Prevenir scroll
                } else {
                    icon.className = 'fas fa-bars';
                    document.body.style.overflow = '';
                }
            });
        }

        // Cerrar sidebar con overlay
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Cerrar sidebar al hacer clic fuera (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && 
                !sidebar?.contains(e.target) && 
                !menuToggle?.contains(e.target) &&
                sidebar?.classList.contains('open')) {
                
                this.closeSidebar();
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
        
        // Courses
        this.controllers.set('courses', new CoursesController());
        
        // Instructors
        this.controllers.set('instructors', new InstructorsController());
        
        // Attendance
        this.controllers.set('attendance', new AttendanceController());
        
        // Reports
        this.controllers.set('reports', new ReportsController());
        
        // Configurar comunicación entre controladores
        this.setupControllerCommunication();
        
        // Referencias globales para uso en HTML
        window.studentsController = this.controllers.get('students');
        window.attendanceController = this.controllers.get('attendance');
        window.coursesController = this.controllers.get('courses');
        window.instructorsController = this.controllers.get('instructors');
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

        document.addEventListener('attendance-updated', () => {
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
        const validSections = ['dashboard', 'students', 'courses', 'instructors', 'attendance', 'reports'];
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

        // Llamar al método onSectionShow del controlador correspondiente
        if (this.controllers.has(sectionName)) {
            const controller = this.controllers.get(sectionName);
            if (controller && typeof controller.onSectionShow === 'function') {
                controller.onSectionShow();
            }
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
            courses: 'Gestión de Cursos',
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

        // Disparar evento de cambio de sección
        document.dispatchEvent(new CustomEvent('section-changed', {
            detail: { section: sectionName }
        }));

        // Cerrar sidebar en mobile después de navegar
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }

    /**
     * Cierra el sidebar móvil
     */
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');
        
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        if (menuToggle && menuToggle.classList.contains('open')) {
            menuToggle.classList.remove('open');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    }

    /**
     * Cierra todas las modales abiertas
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
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
     * Muestra una alerta usando SweetAlert2
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de alerta (success, warning, error, info)
     */
    showAlert(message, type = 'info') {
        const swalConfig = {
            title: this.getAlertTitle(type),
            text: message,
            icon: this.getSwalIcon(type),
            confirmButtonText: 'Entendido',
            confirmButtonColor: this.getButtonColor(type),
            timer: type === 'success' ? 3000 : null,
            timerProgressBar: type === 'success',
            background: '#ffffff',
            color: '#1f2937',
            allowOutsideClick: true,
            allowEscapeKey: true,
            backdrop: `rgba(0, 0, 0, 0.2)`,
            showClass: {
                popup: 'swal2-show'
            },
            hideClass: {
                popup: 'swal2-hide'
            }
        };

        Swal.fire(swalConfig);
    }

    /**
     * Muestra un diálogo de confirmación usando SweetAlert2
     * @param {string} title - Título del diálogo
     * @param {string} message - Mensaje de confirmación
     * @param {string} confirmText - Texto del botón de confirmación
     * @param {string} cancelText - Texto del botón de cancelación
     * @returns {Promise<boolean>} - True si se confirma, false si se cancela
     */
    async showConfirm(title = '¿Estás seguro?', message = '', confirmText = 'Sí, continuar', cancelText = 'Cancelar') {
        const result = await Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true,
            focusCancel: true,
            background: '#ffffff',
            color: '#1f2937',
            backdrop: `rgba(0, 0, 0, 0.2)`,
            allowOutsideClick: false,
            allowEscapeKey: true,
            buttonsStyling: true,
            customClass: {
                confirmButton: 'swal2-delete',
                cancelButton: 'swal2-cancel'
            }
        });

        return result.isConfirmed;
    }

    /**
     * Muestra un toast (notificación pequeña) usando SweetAlert2
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de toast (success, warning, error, info)
     */
    showToast(message, type = 'info') {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: this.getSwalIcon(type),
            title: message
        });
    }

    /**
     * Obtiene el icono de SweetAlert2 para el tipo de alerta
     * @param {string} type - Tipo de alerta
     * @returns {string} Icono de SweetAlert2
     */
    getSwalIcon(type) {
        const icons = {
            success: 'success',
            warning: 'warning',
            danger: 'error',
            error: 'error',
            info: 'info'
        };
        
        return icons[type] || 'info';
    }

    /**
     * Obtiene el título para el tipo de alerta
     * @param {string} type - Tipo de alerta
     * @returns {string} Título apropiado
     */
    getAlertTitle(type) {
        const titles = {
            success: '¡Éxito!',
            warning: 'Atención',
            danger: 'Error',
            error: 'Error',
            info: 'Información'
        };
        
        return titles[type] || 'Información';
    }

    /**
     * Obtiene el color del botón para el tipo de alerta
     * @param {string} type - Tipo de alerta
     * @returns {string} Color del botón
     */
    getButtonColor(type) {
        const colors = {
            success: '#28a745',
            warning: '#ffc107',
            danger: '#dc3545',
            error: '#dc3545',
            info: '#007bff'
        };
        
        return colors[type] || '#007bff';
    }

    /**
     * Obtiene el color del botón de confirmación
     * @param {string} type - Tipo de confirmación
     * @returns {string} Color del botón
     */
    getConfirmButtonColor(type) {
        const colors = {
            delete: '#dc3545',
            warning: '#ffc107',
            info: '#007bff',
            danger: '#dc3545'
        };
        
        return colors[type] || '#dc3545';
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