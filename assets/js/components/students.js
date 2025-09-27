/* ===================================
   STUDENTS.JS - Controlador de Estudiantes
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';
import { FormValidator, ValidationRules } from '../utils/validators.js';
import { COURSES, COURSE_LEVELS, MESSAGES } from '../config/constants.js';

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
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }
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
     * Filtra estudiantes por texto de búsqueda
     * @param {string} searchText - Texto de búsqueda
     */
    filterStudents(searchText) {
        if (!searchText.trim()) {
            this.filteredStudents = [...this.students];
        } else {
            const search = searchText.toLowerCase();
            this.filteredStudents = this.students.filter(student => 
                student.name.toLowerCase().includes(search) ||
                student.email.toLowerCase().includes(search) ||
                COURSES[student.course]?.toLowerCase().includes(search)
            );
        }
        
        this.renderStudentsTable();
    }

    /**
     * Filtra estudiantes por curso
     * @param {string} courseKey - Clave del curso
     */
    filterByCourse(courseKey) {
        if (!courseKey) {
            this.filteredStudents = [...this.students];
        } else {
            this.filteredStudents = this.students.filter(student => 
                student.course === courseKey
            );
        }
        
        this.renderStudentsTable();
    }

    /**
     * Renderiza la tabla de estudiantes
     */
    renderStudentsTable() {
        const tbody = document.getElementById('students-tbody');
        if (!tbody) return;

        if (this.filteredStudents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No se encontraron estudiantes</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredStudents.map(student => `
            <tr data-student-id="${student.id}">
                <td>${student.name}</td>
                <td>${student.email}</td>
                <td>${COURSES[student.course] || student.course}</td>
                <td><span class="badge badge-primary">${student.level}</span></td>
                <td>${DateUtils.formatDateShort(student.enrollmentDate)}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-outline" 
                            onclick="app.controllers.get('students').editStudent(${student.id})"
                            title="Editar estudiante">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" 
                            onclick="app.controllers.get('students').deleteStudent(${student.id})"
                            title="Eliminar estudiante">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
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
    deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        if (confirm(`¿Estás seguro de eliminar a ${student.name}?`)) {
            this.students = this.students.filter(s => s.id !== studentId);
            StorageManager.saveStudents(this.students);
            this.loadData();
            this.renderStudentsTable();
            
            // Disparar evento
            document.dispatchEvent(new CustomEvent('student-deleted', {
                detail: { studentId }
            }));
            
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