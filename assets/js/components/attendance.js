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

    /**
     * Renderiza la tabla de asistencias con estructura moderna
     */
    renderAttendanceTable() {
        const attendanceContainer = document.getElementById('attendance-container');
        if (!attendanceContainer) return;

        // Calcular estadísticas
        const today = DateUtils.formatDate(new Date());
        const todayForInput = DateUtils.formatDateForInput(new Date());
        const todayAttendance = this.attendance.filter(record => record.date === today);
        const presentCount = todayAttendance.filter(r => r.status === 'present').length;
        const absentCount = todayAttendance.filter(r => r.status === 'absent').length;
        const lateCount = todayAttendance.filter(r => r.status === 'late').length;
        const totalToday = todayAttendance.length;

        // Generar estructura completa
        let html = `
            <div class="attendance-header">
                <h2 class="attendance-title">
                    <i class="fas fa-clipboard-check"></i> Control de Asistencias
                </h2>
                <button class="btn-mark-attendance" onclick="window.attendanceController.showAttendanceModal()">
                    <i class="fas fa-check"></i> Marcar Asistencia
                </button>
            </div>

            <div class="attendance-summary">
                <div class="summary-card">
                    <div class="summary-number total">${totalToday}</div>
                    <div class="summary-label">Total Hoy</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number present">${presentCount}</div>
                    <div class="summary-label">Presentes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number absent">${absentCount}</div>
                    <div class="summary-label">Ausentes</div>
                </div>
                <div class="summary-card">
                    <div class="summary-number late">${lateCount}</div>
                    <div class="summary-label">Tardanzas</div>
                </div>
            </div>
            
            <div class="attendance-controls">
                <div class="row">
                    <div class="col-md-6">
                        <input 
                            type="date" 
                            id="filterDate" 
                            class="date-input"
                            value="${todayForInput}"
                            onchange="window.attendanceController.filterByDate()"
                        >
                    </div>
                    <div class="col-md-6">
                        <select 
                            id="filterCourse" 
                            class="filter-select" 
                            onchange="window.attendanceController.filterByCourse()"
                        >
                            <option value="">Todos los cursos</option>
                            ${Object.entries(COURSES).map(([key, value]) => 
                                `<option value="${key}">${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;

        if (this.attendance.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>No hay registros de asistencia</h3>
                    <p>Comienza registrando las asistencias de tus estudiantes</p>
                    <button class="btn-mark-attendance" onclick="window.attendanceController.showAttendanceModal()">
                        <i class="fas fa-check"></i> Registrar Primera Asistencia
                    </button>
                </div>
            `;
        } else {
            // Ordenar por fecha descendente
            const sortedAttendance = [...this.attendance].sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );

            html += `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Curso</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                                <th>Hora</th>
                                <th>Notas</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            sortedAttendance.forEach(record => {
                const student = this.students.find(s => s.id === record.studentId);
                const studentName = student ? student.name : 'Estudiante no encontrado';
                const course = student ? COURSES[student.course] || student.course : '-';
                
                const statusLabels = {
                    present: 'Presente',
                    absent: 'Ausente', 
                    late: 'Tardanza',
                    excused: 'Justificado'
                };

                const statusIcons = {
                    present: '✓',
                    absent: '✗',
                    late: '⏰',
                    excused: '📋'
                };

                html += `
                    <tr>
                        <td>
                            <div class="student-name">
                                <strong>${studentName}</strong>
                            </div>
                        </td>
                        <td>
                            <span class="badge-course">${course}</span>
                        </td>
                        <td>${DateUtils.formatDate(record.date)}</td>
                        <td>
                            <div class="attendance-status ${record.status}">
                                ${statusIcons[record.status] || '?'}
                            </div>
                            <small>${statusLabels[record.status] || record.status}</small>
                        </td>
                        <td>
                            <div class="attendance-time">
                                ${record.time || '--:--'}
                            </div>
                        </td>
                        <td>
                            <span class="text-muted">${record.notes || 'Sin notas'}</span>
                        </td>
                        <td>
                            <div class="attendance-actions">
                                <button class="btn-attendance present" 
                                        onclick="window.attendanceController.updateStatus(${record.id}, 'present')"
                                        title="Marcar presente">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn-attendance absent" 
                                        onclick="window.attendanceController.updateStatus(${record.id}, 'absent')"
                                        title="Marcar ausente">
                                    <i class="fas fa-times"></i>
                                </button>
                                <button class="btn-attendance late" 
                                        onclick="window.attendanceController.updateStatus(${record.id}, 'late')"
                                        title="Marcar tardanza">
                                    <i class="fas fa-clock"></i>
                                </button>
                                <button class="btn btn-danger" 
                                        onclick="window.attendanceController.deleteAttendance(${record.id})"
                                        title="Eliminar registro">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        attendanceContainer.innerHTML = html;
    }

    /**
     * Actualiza el estado de asistencia de un registro
     */
    updateStatus(recordId, newStatus) {
        const record = this.attendance.find(r => r.id === recordId);
        if (!record) return;

        record.status = newStatus;
        record.time = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        StorageManager.saveAttendance(this.attendance);
        this.renderAttendanceTable();

        // Mostrar mensaje de confirmación
        if (window.app && window.app.showAlert) {
            const statusLabels = {
                present: 'presente',
                absent: 'ausente',
                late: 'tardanza'
            };
            window.app.showAlert(
                `Estado actualizado a ${statusLabels[newStatus] || newStatus}`, 
                'success'
            );
        }
    }

    /**
     * Filtra asistencias por fecha
     */
    filterByDate() {
        const selectedDate = document.getElementById('filterDate')?.value;
        if (!selectedDate) {
            this.renderAttendanceTable();
            return;
        }

        const filteredAttendance = this.attendance.filter(record => 
            record.date === selectedDate
        );

        // Temporalmente reemplazar los datos para el renderizado
        const originalAttendance = this.attendance;
        this.attendance = filteredAttendance;
        this.renderAttendanceTable();
        this.attendance = originalAttendance;
    }

    /**
     * Filtra asistencias por curso
     */
    filterByCourse() {
        const selectedCourse = document.getElementById('filterCourse')?.value;
        if (!selectedCourse) {
            this.renderAttendanceTable();
            return;
        }

        const studentsInCourse = this.students
            .filter(s => s.course === selectedCourse)
            .map(s => s.id);

        const filteredAttendance = this.attendance.filter(record => 
            studentsInCourse.includes(record.studentId)
        );

        // Temporalmente reemplazar los datos para el renderizado
        const originalAttendance = this.attendance;
        this.attendance = filteredAttendance;
        this.renderAttendanceTable();
        this.attendance = originalAttendance;
    }
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