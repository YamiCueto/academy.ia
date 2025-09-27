/* ===================================
   ATTENDANCE.JS - Controlador de Asistencias
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';
import { ATTENDANCE_STATUS, COURSES } from '../config/constants.js';

/**
 * Controlador para la gestión de asistencias
 */
export class AttendanceController {
    
    constructor() {
        this.students = [];
        this.attendance = [];
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
    }

    loadData() {
        this.students = StorageManager.getStudents();
        this.attendance = StorageManager.getAttendance();
    }

    setupEventListeners() {
        // Event listeners para asistencias
        const markBtn = document.getElementById('mark-attendance');
        if (markBtn) {
            markBtn.addEventListener('click', () => this.showAttendanceModal());
        }
        
        // Setup modal buttons
        this.setupModalButtons();
    }
    
    /**
     * Configura botones del modal
     */
    setupModalButtons() {
        const closeBtn = document.getElementById('close-attendance-modal');
        const cancelBtn = document.getElementById('cancel-attendance');
        const modalOverlay = document.getElementById('attendance-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }
        
        // Cerrar modal al hacer clic en el overlay
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideModal();
                }
            });
        }
        
        // Cerrar modal con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    onSectionShow() {
        this.loadData();
        this.renderAttendanceTable();
        this.populateStudentOptions();
    }

    showAttendanceModal() {
        const modal = document.getElementById('attendance-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    /**
     * Oculta el modal de asistencia
     */
    hideModal() {
        const modal = document.getElementById('attendance-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Reset form
        const form = document.getElementById('attendance-form');
        if (form) {
            form.reset();
        }
    }

    populateStudentOptions() {
        const select = document.getElementById('attendance-student');
        if (select) {
            const options = this.students.map(student => 
                `<option value="${student.id}">${student.name} - ${COURSES[student.course]}</option>`
            ).join('');
            
            select.innerHTML = '<option value="">Seleccionar estudiante</option>' + options;
        }
    }

    renderAttendanceTable() {
        const tbody = document.getElementById('attendance-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6">Cargando asistencias...</td></tr>';
        }
    }
}