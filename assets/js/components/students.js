/* ===================================
   STUDENTS.JS - Controlador de Estudiantes
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';
import { FormValidator, ValidationRules } from '../utils/validators.js';
import { COURSES, COURSE_LEVELS, ALL_LEVELS, MESSAGES } from '../config/constants.js';

/**
 * Controlador para la gestión de estudiantes
 */
export class StudentsController {
    
    constructor() {
        this.students = [];
        this.filteredStudents = [];
        this.currentStudent = null;
        this.validator = new FormValidator();
        
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupFormValidation();
        this.populateFormOptions();
    }

    /**
     * Carga datos desde localStorage
     */
    loadData() {
        this.students = StorageManager.getStudents();
        this.filteredStudents = [...this.students];
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botón agregar estudiante
        const addBtn = document.getElementById('add-student');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }

        // Formulario de estudiante
        const form = document.getElementById('student-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Botones del modal
        this.setupModalButtons();

        // Filtros y búsqueda
        this.setupFilters();

        // Cambio de curso para actualizar niveles
        const courseSelect = document.getElementById('student-course');
        if (courseSelect) {
            courseSelect.addEventListener('change', (e) => {
                this.updateLevelOptions(e.target.value);
            });
        }
    }

    /**
     * Configura botones del modal
     */
    setupModalButtons() {
        const closeBtn = document.getElementById('close-student-modal');
        const cancelBtn = document.getElementById('cancel-student');
        const modalOverlay = document.getElementById('student-modal');
        
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

    /**
     * Configura filtros y búsqueda
     */
    setupFilters() {
        // Búsqueda
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterStudents(e.target.value);
            });
        }

        // Filtro por curso
        const courseFilter = document.getElementById('course-filter');
        if (courseFilter) {
            courseFilter.addEventListener('change', (e) => {
                this.filterByCourse(e.target.value);
            });
        }
    }

    /**
     * Configura validación del formulario
     */
    setupFormValidation() {
        // Agregar reglas de validación
        Object.entries(ValidationRules.student).forEach(([field, rules]) => {
            this.validator.addRule(field, rules);
        });
    }

    /**
     * Llena opciones de los selects del formulario
     */
    populateFormOptions() {
        this.populateCourseOptions();
        this.populateCourseFilter();
    }

    /**
     * Llena opciones de cursos
     */
    populateCourseOptions() {
        const courseSelect = document.getElementById('student-course');
        const courseFilter = document.getElementById('course-filter');
        
        const courseOptionsHTML = Object.entries(COURSES).map(([key, name]) => 
            `<option value="${key}">${name}</option>`
        ).join('');

        if (courseSelect) {
            courseSelect.innerHTML = '<option value="">Seleccionar curso</option>' + courseOptionsHTML;
        }
    }

    /**
     * Llena opciones del filtro de cursos
     */
    populateCourseFilter() {
        const courseFilter = document.getElementById('course-filter');
        
        if (courseFilter) {
            const courseOptionsHTML = Object.entries(COURSES).map(([key, name]) => 
                `<option value="${key}">${name}</option>`
            ).join('');
            
            courseFilter.innerHTML = '<option value="">Todos los cursos</option>' + courseOptionsHTML;
        }
    }

    /**
     * Actualiza opciones de nivel según el curso
     * @param {string} courseKey - Clave del curso
     */
    updateLevelOptions(courseKey) {
        const levelSelect = document.getElementById('student-level');
        if (!levelSelect) return;

        if (!courseKey) {
            levelSelect.innerHTML = '<option value="">Seleccionar nivel</option>';
            return;
        }

        const levels = COURSE_LEVELS[courseKey] || [];
        const levelOptionsHTML = levels.map(level => 
            `<option value="${level}">${level}</option>`
        ).join('');

        levelSelect.innerHTML = '<option value="">Seleccionar nivel</option>' + levelOptionsHTML;
    }

    /**
     * Se ejecuta cuando se muestra la sección
     */
    onSectionShow() {
        this.loadData();
        this.renderStudentsTable();
    }

    /**
     * Filtra estudiantes según múltiples criterios
     */
    filterStudents() {
        const searchTerm = document.getElementById('searchStudents')?.value.toLowerCase() || '';
        const courseFilter = document.getElementById('filterCourse')?.value || '';
        const levelFilter = document.getElementById('filterLevel')?.value || '';

        this.filteredStudents = this.students.filter(student => {
            const matchesSearch = 
                student.name.toLowerCase().includes(searchTerm) ||
                student.email.toLowerCase().includes(searchTerm);
            
            const matchesCourse = !courseFilter || student.course === courseFilter;
            
            const matchesLevel = !levelFilter || student.level === levelFilter;

            return matchesSearch && matchesCourse && matchesLevel;
        });

        this.renderStudentsTable();
    }

    /**
     * Renderiza la tabla de estudiantes con estructura moderna
     */
    renderStudentsTable() {
        const studentsContainer = document.getElementById('students-container');
        if (!studentsContainer) return;

        // Generar estructura completa
        let html = `
            <div class="students-header">
                <h2 class="students-title">
                    <i class="fas fa-user-graduate"></i> Gestión de Estudiantes
                </h2>
                <button class="btn-add-student" onclick="window.studentsController.showAddModal()">
                    <i class="fas fa-plus"></i> Agregar Estudiante
                </button>
            </div>
            
            <div class="students-controls">
                <div class="row">
                    <div class="col-md-6">
                        <div class="students-search">
                            <input 
                                type="text" 
                                id="searchStudents" 
                                placeholder="Buscar estudiante..."
                                oninput="window.studentsController.filterStudents()"
                            >
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select 
                            id="filterCourse" 
                            class="filter-select" 
                            onchange="window.studentsController.filterStudents()"
                        >
                            <option value="">Todos los cursos</option>
                            ${Object.entries(COURSES).map(([key, value]) => 
                                `<option value="${key}">${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select 
                            id="filterLevel" 
                            class="filter-select" 
                            onchange="window.studentsController.filterStudents()"
                        >
                            <option value="">Todos los niveles</option>
                            ${ALL_LEVELS.map(level => 
                                `<option value="${level}">${level}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;

        if (this.filteredStudents.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">👨‍🎓</div>
                    <h3>No hay estudiantes registrados</h3>
                    <p>Comienza agregando tu primer estudiante al sistema</p>
                    <button class="btn-add-student" onclick="window.studentsController.showAddModal()">
                        <i class="fas fa-plus"></i> Agregar Primer Estudiante
                    </button>
                </div>
            `;
        } else {
            html += `
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Nombre Completo</th>
                                <th>Email</th>
                                <th>Curso</th>
                                <th>Nivel</th>
                                <th>Fecha Inscripción</th>
                                <th>Asistencia</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.filteredStudents.forEach(student => {
                // Generar iniciales para el avatar
                const fullName = student.name || 'Estudiante';
                const initials = fullName.split(' ')
                    .map(name => name.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('');

                // Calcular porcentaje de asistencia (simulado por ahora)
                const attendanceRate = student.attendanceRate || Math.floor(Math.random() * 30 + 70);
                let attendanceClass = 'low';
                if (attendanceRate >= 85) attendanceClass = 'high';
                else if (attendanceRate >= 70) attendanceClass = 'medium';

                html += `
                    <tr data-student-id="${student.id}">
                        <td>
                            <div class="student-avatar">
                                ${initials}
                            </div>
                        </td>
                        <td>
                            <div class="student-name">
                                <strong>${student.name}</strong>
                                <small>ID: ${student.id}</small>
                            </div>
                        </td>
                        <td>
                            <a href="mailto:${student.email}" class="email-link">
                                ${student.email}
                            </a>
                        </td>
                        <td>
                            <span class="badge-course">
                                ${COURSES[student.course] || student.course}
                            </span>
                        </td>
                        <td>
                            <span class="badge-level">
                                ${student.level}
                            </span>
                        </td>
                        <td>
                            ${DateUtils.formatDateShort(student.enrollmentDate)}
                        </td>
                        <td>
                            <div class="attendance-rate">
                                <span class="attendance-percentage ${attendanceClass}">
                                    ${attendanceRate}%
                                </span>
                                <div class="attendance-bar">
                                    <div class="attendance-progress ${attendanceClass}" 
                                         style="width: ${attendanceRate}%"></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-outline" 
                                        onclick="window.studentsController.editStudent(${student.id})"
                                        title="Editar estudiante"
                                        aria-label="Editar estudiante ${student.name}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" 
                                        onclick="window.studentsController.deleteStudent(${student.id})"
                                        title="Eliminar estudiante"
                                        aria-label="Eliminar estudiante ${student.name}">
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

        studentsContainer.innerHTML = html;
    }

    /**
     * Muestra modal para agregar estudiante
     */
    showAddModal() {
        this.currentStudent = null;
        this.resetForm();
        
        const modal = document.getElementById('student-modal');
        const title = document.getElementById('student-modal-title');
        
        if (title) {
            title.textContent = 'Agregar Estudiante';
        }
        
        if (modal) {
            modal.classList.add('active');
        }
        
        // Focus en primer campo
        setTimeout(() => {
            const firstInput = document.getElementById('student-name');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    /**
     * Muestra modal para editar estudiante
     * @param {number} studentId - ID del estudiante
     */
    editStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        this.currentStudent = student;
        this.populateForm(student);
        
        const modal = document.getElementById('student-modal');
        const title = document.getElementById('student-modal-title');
        
        if (title) {
            title.textContent = 'Editar Estudiante';
        }
        
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Elimina un estudiante
     * @param {number} studentId - ID del estudiante
     */
    async deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const confirmed = await window.app.showConfirm(
            'Eliminar Estudiante',
            `¿Estás seguro de eliminar a ${student.name}? Esta acción no se puede deshacer.`,
            'Sí, eliminar',
            'Cancelar'
        );

        if (confirmed) {
            this.students = this.students.filter(s => s.id !== studentId);
            StorageManager.saveStudents(this.students);
            this.loadData();
            this.renderStudentsTable();
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('student-deleted', {
                detail: { studentId }
            }));

            // Mostrar mensaje de éxito
            window.app.showAlert(`Estudiante ${student.name} eliminado correctamente`, 'success');
            
            this.showMessage(MESSAGES.SUCCESS.STUDENT_DELETED, 'success');
        }
    }

    /**
     * Oculta el modal
     */
    hideModal() {
        const modal = document.getElementById('student-modal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        this.resetForm();
        this.currentStudent = null;
    }

    /**
     * Resetea el formulario
     */
    resetForm() {
        const form = document.getElementById('student-form');
        if (form) {
            form.reset();
            this.clearErrors();
            
            // Limpiar niveles
            const levelSelect = document.getElementById('student-level');
            if (levelSelect) {
                levelSelect.innerHTML = '<option value="">Seleccionar nivel</option>';
            }
        }
    }

    /**
     * Llena el formulario con datos del estudiante
     * @param {Object} student - Datos del estudiante
     */
    populateForm(student) {
        const fields = ['name', 'email', 'phone', 'course', 'level', 'enrollmentDate'];
        
        fields.forEach(field => {
            const input = document.getElementById(`student-${field === 'enrollmentDate' ? 'enrollment' : field}`);
            if (input && student[field]) {
                input.value = student[field];
            }
        });
        
        // Actualizar niveles para el curso seleccionado
        if (student.course) {
            this.updateLevelOptions(student.course);
            setTimeout(() => {
                const levelSelect = document.getElementById('student-level');
                if (levelSelect && student.level) {
                    levelSelect.value = student.level;
                }
            }, 50);
        }
    }

    /**
     * Maneja envío del formulario
     * @param {Event} e - Evento de submit
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const studentData = Object.fromEntries(formData.entries());
        
        // Validar formulario
        const validation = this.validator.validate(studentData);
        
        if (!validation.isValid) {
            this.showErrors(validation.errors);
            return;
        }
        
        this.clearErrors();
        
        if (this.currentStudent) {
            this.updateStudent(studentData);
        } else {
            this.addStudent(studentData);
        }
    }

    /**
     * Agrega nuevo estudiante
     * @param {Object} studentData - Datos del estudiante
     */
    addStudent(studentData) {
        const newStudent = {
            id: Date.now(), // Simple ID generation
            ...studentData,
            enrollmentDate: studentData.enrollmentDate
        };
        
        // Verificar email único
        if (this.students.some(s => s.email === newStudent.email)) {
            this.showErrors({ email: MESSAGES.ERROR.DUPLICATE_EMAIL });
            return;
        }
        
        this.students.push(newStudent);
        StorageManager.saveStudents(this.students);
        this.loadData();
        this.renderStudentsTable();
        this.hideModal();
        
        // Disparar evento
        document.dispatchEvent(new CustomEvent('student-added', {
            detail: { student: newStudent }
        }));
        
        this.showMessage(MESSAGES.SUCCESS.STUDENT_ADDED, 'success');
    }

    /**
     * Actualiza estudiante existente
     * @param {Object} studentData - Datos del estudiante
     */
    updateStudent(studentData) {
        const index = this.students.findIndex(s => s.id === this.currentStudent.id);
        if (index === -1) return;
        
        // Verificar email único (excluyendo el estudiante actual)
        if (this.students.some(s => s.email === studentData.email && s.id !== this.currentStudent.id)) {
            this.showErrors({ email: MESSAGES.ERROR.DUPLICATE_EMAIL });
            return;
        }
        
        this.students[index] = {
            ...this.currentStudent,
            ...studentData
        };
        
        StorageManager.saveStudents(this.students);
        this.loadData();
        this.renderStudentsTable();
        this.hideModal();
        
        // Disparar evento
        document.dispatchEvent(new CustomEvent('student-updated', {
            detail: { student: this.students[index] }
        }));
        
        this.showMessage(MESSAGES.SUCCESS.STUDENT_UPDATED, 'success');
    }

    /**
     * Muestra errores en el formulario
     * @param {Object} errors - Objeto de errores
     */
    showErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
            
            // Resaltar campo con error
            const inputElement = document.getElementById(`student-${field === 'enrollmentDate' ? 'enrollment' : field}`);
            if (inputElement) {
                inputElement.classList.add('error');
            }
        });
    }

    /**
     * Limpia errores del formulario
     */
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        document.querySelectorAll('.form-input, .form-select').forEach(element => {
            element.classList.remove('error');
        });
    }

    /**
     * Muestra mensaje temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje
     */
    showMessage(message, type = 'info') {
        // Implementar sistema de notificaciones
        if (window.app && window.app.showAlert) {
            window.app.showAlert(message, type);
        }
    }

    /**
     * Exporta datos de estudiantes
     * @returns {Object} Datos exportados
     */
    exportStudents() {
        return {
            students: this.students,
            totalCount: this.students.length,
            courseDistribution: this.getCourseDistribution(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Obtiene distribución de estudiantes por curso
     * @returns {Object} Distribución por curso
     */
    getCourseDistribution() {
        const distribution = {};
        
        this.students.forEach(student => {
            const courseName = COURSES[student.course] || student.course;
            distribution[courseName] = (distribution[courseName] || 0) + 1;
        });
        
        return distribution;
    }
}