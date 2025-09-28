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
        
        // Form submission handler
        const form = document.getElementById('attendance-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
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
            // Establecer fecha actual por defecto
            const dateInput = document.getElementById('attendance-date-input');
            if (dateInput) {
                dateInput.value = DateUtils.formatDateForInput(new Date());
            }
            
            // Llenar opciones de estudiantes
            this.populateStudentOptions();
            
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
        if (!tbody) return;

        if (this.attendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay registros de asistencia</td></tr>';
            return;
        }

        // Ordenar por fecha descendente
        const sortedAttendance = [...this.attendance].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        const html = sortedAttendance.map(record => {
            const student = this.students.find(s => s.id === record.studentId);
            const studentName = student ? student.name : 'Estudiante no encontrado';
            const course = student ? COURSES[student.course] || student.course : '-';
            
            const statusLabels = {
                present: 'Presente',
                absent: 'Ausente', 
                late: 'Tardanza',
                excused: 'Justificado'
            };
            
            const statusClass = {
                present: 'status-present',
                absent: 'status-absent',
                late: 'status-late', 
                excused: 'status-excused'
            };

            return `
                <tr>
                    <td>${studentName}</td>
                    <td>${course}</td>
                    <td>${DateUtils.formatDate(record.date)}</td>
                    <td>
                        <span class="status-badge ${statusClass[record.status] || ''}">
                            ${statusLabels[record.status] || record.status}
                        </span>
                    </td>
                    <td>${record.notes || '-'}</td>
                    <td>
                        <button class="btn btn-outline btn-sm" onclick="window.attendanceController.deleteAttendance(${record.id})" title="Eliminar registro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = html;
    }

    /**
     * Maneja el envío del formulario de asistencia
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const attendanceData = {
            id: Date.now(),
            studentId: parseInt(formData.get('studentId')),
            date: formData.get('date'),
            status: formData.get('status'),
            notes: formData.get('notes') || ''
        };

        // Validar datos
        if (!attendanceData.studentId || !attendanceData.date || !attendanceData.status) {
            window.app.showAlert('Por favor complete todos los campos obligatorios', 'warning');
            return;
        }

        // Verificar si ya existe un registro para este estudiante en esta fecha
        const existingRecord = this.attendance.find(record => 
            record.studentId === attendanceData.studentId && 
            record.date === attendanceData.date
        );

        if (existingRecord) {
            const confirmed = await window.app.showConfirm(
                'Registro Duplicado',
                'Ya existe un registro de asistencia para este estudiante en esta fecha. ¿Desea actualizarlo?',
                'Sí, actualizar',
                'Cancelar'
            );
            
            if (confirmed) {
                existingRecord.status = attendanceData.status;
                existingRecord.notes = attendanceData.notes;
                window.app.showAlert('Registro de asistencia actualizado correctamente', 'success');
            } else {
                return;
            }
        } else {
            this.attendance.push(attendanceData);
            window.app.showAlert('Registro de asistencia creado correctamente', 'success');
        }

        // Guardar en localStorage
        StorageManager.saveAttendance(this.attendance);

        // Actualizar vista
        this.renderAttendanceTable();
        
        // Disparar evento de actualización
        document.dispatchEvent(new CustomEvent('attendance-updated', {
            detail: attendanceData
        }));

        // Cerrar modal
        this.hideModal();

        // Limpiar formulario y mostrar confirmación
        document.getElementById('attendance-form').reset();
    }

    /**
     * Elimina un registro de asistencia
     */
    async deleteAttendance(recordId) {
        const confirmed = await window.app.showConfirm(
            'Eliminar Registro',
            '¿Está seguro de eliminar este registro de asistencia?',
            'Sí, eliminar',
            'Cancelar'
        );

        if (confirmed) {
            this.attendance = this.attendance.filter(record => record.id !== recordId);
            StorageManager.saveAttendance(this.attendance);
            this.renderAttendanceTable();
            
            // Disparar evento de actualización
            document.dispatchEvent(new CustomEvent('attendance-updated'));
            
            window.app.showAlert('Registro eliminado correctamente', 'success');
        }
    }

    /**
     * Muestra mensaje de éxito usando SweetAlert2
     */
    showSuccessMessage(message) {
        if (window.app && window.app.showAlert) {
            window.app.showAlert(message, 'success');
        }
    }
}