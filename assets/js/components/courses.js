/**
 * Controlador para la gestión de cursos
 * Maneja el CRUD completo de cursos de idiomas
 */

import { StorageManager } from '../utils/storage.js';
import { MESSAGES } from '../config/constants.js';

export class CoursesController {
    constructor() {
        this.courses = [];
        this.currentCourse = null;
        this.filteredCourses = [];
        
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.loadData();
        this.attachEventListeners();
        this.renderCoursesTable();
    }

    /**
     * Carga los datos desde localStorage
     */
    loadData() {
        this.courses = StorageManager.getCourses();
        this.filteredCourses = [...this.courses];
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        // Botón agregar curso
        document.getElementById('add-course')?.addEventListener('click', () => {
            this.showModal();
        });

        // Cerrar modal
        document.getElementById('close-course-modal')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-course')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Formulario de curso
        document.getElementById('course-form')?.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Filtros
        document.getElementById('course-search')?.addEventListener('input', (e) => {
            this.filterCourses();
        });

        document.getElementById('course-level-filter')?.addEventListener('change', () => {
            this.filterCourses();
        });

        document.getElementById('course-language-filter')?.addEventListener('change', () => {
            this.filterCourses();
        });

        // Validación en tiempo real del código
        document.getElementById('course-code')?.addEventListener('input', (e) => {
            this.validateCourseCode(e.target.value);
        });

        // Escuchar cuando se carga la sección
        document.addEventListener('section-changed', (e) => {
            if (e.detail.section === 'courses') {
                this.onSectionLoad();
            }
        });
    }

    /**
     * Se ejecuta cuando se carga la sección de cursos
     */
    onSectionLoad() {
        this.loadData();
        this.renderCoursesTable();
    }

    /**
     * Muestra el modal para agregar/editar curso
     * @param {Object} course - Curso a editar (opcional)
     */
    showModal(course = null) {
        const modal = document.getElementById('course-modal');
        const title = document.getElementById('course-modal-title');
        const saveButton = document.getElementById('save-course-text');
        
        // Cargar instructores disponibles
        this.loadInstructors();
        
        if (course) {
            // Modo edición
            this.currentCourse = course;
            title.textContent = 'Editar Curso';
            saveButton.textContent = 'Actualizar Curso';
            this.fillForm(course);
        } else {
            // Modo agregar
            this.currentCourse = null;
            title.textContent = 'Agregar Curso';
            saveButton.textContent = 'Guardar Curso';
            this.clearForm();
        }

        modal.classList.add('active');
        document.getElementById('course-code').focus();
    }

    /**
     * Oculta el modal
     */
    hideModal() {
        const modal = document.getElementById('course-modal');
        modal.classList.remove('active');
        this.clearForm();
        this.clearErrors();
        this.currentCourse = null;
    }

    /**
     * Llena el formulario con los datos del curso
     * @param {Object} course - Datos del curso
     */
    fillForm(course) {
        document.getElementById('course-code').value = course.code || '';
        document.getElementById('course-name').value = course.name || '';
        document.getElementById('course-language').value = course.language || '';
        document.getElementById('course-level').value = course.level || '';
        document.getElementById('course-duration').value = course.duration || '';
        document.getElementById('course-schedule').value = course.schedule || '';
        
        // Manejar el campo instructor (ahora es un select)
        const instructorSelect = document.getElementById('course-instructor');
        if (course.instructor) {
            // Esperar a que se carguen los instructores antes de seleccionar
            setTimeout(() => {
                instructorSelect.value = course.instructor;
                if (instructorSelect.value) {
                    instructorSelect.classList.add('has-value');
                }
            }, 100);
        }
        
        document.getElementById('course-capacity').value = course.capacity || 20;
        document.getElementById('course-description').value = course.description || '';
        document.getElementById('course-start-date').value = course.startDate || '';
        document.getElementById('course-status').value = course.status || 'planificado';
    }

    /**
     * Limpia el formulario
     */
    clearForm() {
        document.getElementById('course-form').reset();
        document.getElementById('course-capacity').value = 20;
        document.getElementById('course-status').value = 'planificado';
        
        // Limpiar estilos especiales del select de instructor
        const instructorSelect = document.getElementById('course-instructor');
        if (instructorSelect) {
            instructorSelect.classList.remove('has-value');
        }
    }

    /**
     * Limpia los mensajes de error
     */
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
        
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(element => {
            element.classList.remove('error');
        });
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento del formulario
     */
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const courseData = {
            code: formData.get('code').trim().toUpperCase(),
            name: formData.get('name').trim(),
            language: formData.get('language'),
            level: formData.get('level'),
            duration: parseInt(formData.get('duration')),
            schedule: formData.get('schedule').trim(),
            instructor: formData.get('instructor').trim(),
            capacity: parseInt(formData.get('capacity')) || 20,
            description: formData.get('description').trim(),
            startDate: formData.get('startDate') || null,
            status: formData.get('status') || 'planificado'
        };

        // Validar datos
        if (!this.validateCourseData(courseData)) {
            return;
        }

        if (this.currentCourse) {
            this.updateCourse(courseData);
        } else {
            this.addCourse(courseData);
        }
    }

    /**
     * Valida los datos del curso
     * @param {Object} courseData - Datos del curso
     * @returns {boolean} - True si los datos son válidos
     */
    validateCourseData(courseData) {
        let isValid = true;
        this.clearErrors();

        // Validar código del curso
        if (!courseData.code) {
            this.showError('code', 'El código del curso es obligatorio');
            isValid = false;
        } else if (courseData.code.length < 3) {
            this.showError('code', 'El código debe tener al menos 3 caracteres');
            isValid = false;
        } else if (!this.isValidCourseCode(courseData.code)) {
            this.showError('code', 'El código debe tener formato válido (Ej: ENG-101)');
            isValid = false;
        }

        // Validar nombre
        if (!courseData.name) {
            this.showError('name', 'El nombre del curso es obligatorio');
            isValid = false;
        } else if (courseData.name.length < 3) {
            this.showError('name', 'El nombre debe tener al menos 3 caracteres');
            isValid = false;
        }

        // Validar idioma
        if (!courseData.language) {
            this.showError('language', 'El idioma es obligatorio');
            isValid = false;
        }

        // Validar nivel
        if (!courseData.level) {
            this.showError('level', 'El nivel es obligatorio');
            isValid = false;
        }

        // Validar duración
        if (!courseData.duration || courseData.duration < 1) {
            this.showError('duration', 'La duración debe ser mayor a 0');
            isValid = false;
        }

        // Validar horario
        if (!courseData.schedule) {
            this.showError('schedule', 'El horario es obligatorio');
            isValid = false;
        }

        // Validar instructor
        if (!courseData.instructor) {
            this.showError('instructor', 'El instructor es obligatorio');
            isValid = false;
        }

        // Verificar código único
        if (this.isDuplicateCourseCode(courseData.code)) {
            this.showError('code', 'Ya existe un curso con este código');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Valida el formato del código del curso
     * @param {string} code - Código a validar
     * @returns {boolean} - True si es válido
     */
    isValidCourseCode(code) {
        // Formato: 3-4 letras + guión + 2-3 números (Ej: ENG-101, FREN-1A)
        const codePattern = /^[A-Z]{2,4}-[A-Z0-9]{2,3}$/;
        return codePattern.test(code);
    }

    /**
     * Verifica si el código del curso ya existe
     * @param {string} code - Código a verificar
     * @returns {boolean} - True si está duplicado
     */
    isDuplicateCourseCode(code) {
        return this.courses.some(course => 
            course.code === code && 
            (!this.currentCourse || course.id !== this.currentCourse.id)
        );
    }

    /**
     * Valida el código del curso en tiempo real
     * @param {string} code - Código a validar
     */
    validateCourseCode(code) {
        const errorElement = document.getElementById('code-error');
        const inputElement = document.getElementById('course-code');
        
        if (!code) {
            this.hideError('code');
            return;
        }

        code = code.toUpperCase();
        inputElement.value = code;

        if (code.length < 3) {
            this.showError('code', 'Mínimo 3 caracteres');
            return;
        }

        if (!this.isValidCourseCode(code)) {
            this.showError('code', 'Formato: ABC-123');
            return;
        }

        if (this.isDuplicateCourseCode(code)) {
            this.showError('code', 'Código ya existe');
            return;
        }

        this.hideError('code');
    }

    /**
     * Muestra un error en el formulario
     * @param {string} field - Campo con error
     * @param {string} message - Mensaje de error
     */
    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(`course-${field}`);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }

    /**
     * Oculta el error de un campo
     * @param {string} field - Campo a limpiar
     */
    hideError(field) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(`course-${field}`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    /**
     * Agrega un nuevo curso
     * @param {Object} courseData - Datos del curso
     */
    addCourse(courseData) {
        const newCourse = {
            id: Date.now(),
            ...courseData,
            studentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.courses.push(newCourse);
        StorageManager.saveCourses(this.courses);
        this.loadData();
        this.renderCoursesTable();
        this.hideModal();

        // Disparar evento
        document.dispatchEvent(new CustomEvent('course-added', {
            detail: { course: newCourse }
        }));

        this.showMessage('Curso agregado correctamente', 'success');
    }

    /**
     * Actualiza un curso existente
     * @param {Object} courseData - Datos del curso
     */
    updateCourse(courseData) {
        const index = this.courses.findIndex(c => c.id === this.currentCourse.id);
        if (index === -1) return;

        this.courses[index] = {
            ...this.currentCourse,
            ...courseData,
            updatedAt: new Date().toISOString()
        };

        StorageManager.saveCourses(this.courses);
        this.loadData();
        this.renderCoursesTable();
        this.hideModal();

        // Disparar evento
        document.dispatchEvent(new CustomEvent('course-updated', {
            detail: { course: this.courses[index] }
        }));

        this.showMessage('Curso actualizado correctamente', 'success');
    }

    /**
     * Elimina un curso
     * @param {number} courseId - ID del curso
     */
    async deleteCourse(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        const confirmed = await window.app.showConfirm(
            'Eliminar Curso',
            `¿Estás seguro de eliminar el curso "${course.name}"? Esta acción no se puede deshacer.`,
            'Sí, eliminar',
            'Cancelar',
            'delete'
        );

        if (confirmed) {
            this.courses = this.courses.filter(c => c.id !== courseId);
            StorageManager.saveCourses(this.courses);
            this.loadData();
            this.renderCoursesTable();

            // Disparar evento
            document.dispatchEvent(new CustomEvent('course-deleted', {
                detail: { courseId }
            }));

            window.app.showAlert(`Curso "${course.name}" eliminado correctamente`, 'success');
        }
    }

    /**
     * Filtra los cursos según los criterios seleccionados
     */
    filterCourses() {
        const searchTerm = document.getElementById('course-search')?.value.toLowerCase() || '';
        const levelFilter = document.getElementById('course-level-filter')?.value || '';
        const languageFilter = document.getElementById('course-language-filter')?.value || '';

        this.filteredCourses = this.courses.filter(course => {
            const matchesSearch = 
                course.name.toLowerCase().includes(searchTerm) ||
                course.code.toLowerCase().includes(searchTerm) ||
                course.instructor.toLowerCase().includes(searchTerm);
            
            const matchesLevel = !levelFilter || course.level === levelFilter;
            const matchesLanguage = !languageFilter || course.language === languageFilter;

            return matchesSearch && matchesLevel && matchesLanguage;
        });

        this.renderCoursesTable();
    }

    /**
     * Renderiza la tabla de cursos
     */
    renderCoursesTable() {
        const tbody = document.getElementById('courses-tbody');
        if (!tbody) return;

        if (this.filteredCourses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="fas fa-book-open fa-2x mb-2"></i>
                        <p>No hay cursos disponibles</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredCourses.map(course => `
            <tr>
                <td><strong>${course.code}</strong></td>
                <td>${course.name}</td>
                <td>
                    <span class="badge badge-language badge-${course.language.toLowerCase()}">
                        ${course.language}
                    </span>
                </td>
                <td>
                    <span class="badge badge-level badge-${course.level.toLowerCase()}">
                        ${course.level}
                    </span>
                </td>
                <td>${course.duration} semanas</td>
                <td><small>${course.schedule}</small></td>
                <td>${course.instructor}</td>
                <td>
                    <span class="students-count">
                        ${course.studentsCount || 0}/${course.capacity}
                    </span>
                </td>
                <td>
                    <span class="badge badge-status badge-${course.status}">
                        ${this.getStatusText(course.status)}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" 
                                onclick="window.coursesController.showModal(${JSON.stringify(course).replace(/"/g, '&quot;')})"
                                title="Editar curso"
                                aria-label="Editar curso ${course.name}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" 
                                onclick="window.coursesController.deleteCourse(${course.id})"
                                title="Eliminar curso"
                                aria-label="Eliminar curso ${course.name}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Obtiene el texto del estado
     * @param {string} status - Estado del curso
     * @returns {string} - Texto del estado
     */
    getStatusText(status) {
        const statusTexts = {
            'planificado': 'Planificado',
            'activo': 'Activo',
            'finalizado': 'Finalizado',
            'cancelado': 'Cancelado'
        };
        
        return statusTexts[status] || status;
    }

    /**
     * Muestra un mensaje temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje
     */
    showMessage(message, type = 'info') {
        if (window.app && window.app.showAlert) {
            window.app.showAlert(message, type);
        }
    }

    /**
     * Obtiene un curso por su ID
     * @param {number} courseId - ID del curso
     * @returns {Object|null} - Curso encontrado o null
     */
    getCourseById(courseId) {
        return this.courses.find(course => course.id === courseId) || null;
    }

    /**
     * Obtiene cursos activos
     * @returns {Array} - Array de cursos activos
     */
    getActiveCourses() {
        return this.courses.filter(course => course.status === 'activo');
    }

    /**
     * Obtiene estadísticas de cursos
     * @returns {Object} - Objeto con estadísticas
     */
    getCoursesStats() {
        return {
            total: this.courses.length,
            active: this.courses.filter(c => c.status === 'activo').length,
            planned: this.courses.filter(c => c.status === 'planificado').length,
            finished: this.courses.filter(c => c.status === 'finalizado').length,
            cancelled: this.courses.filter(c => c.status === 'cancelado').length
        };
    }

    /**
     * Carga los instructores disponibles en el combo
     */
    loadInstructors() {
        const instructorSelect = document.getElementById('course-instructor');
        if (!instructorSelect) return;

        // Agregar clase de loading
        instructorSelect.classList.add('loading');
        
        // Obtener instructores desde StorageManager
        const instructors = StorageManager.getInstructors();
        
        // Limpiar opciones existentes excepto la primera
        instructorSelect.innerHTML = '<option value="">Seleccionar instructor</option>';
        
        // Filtrar solo instructores activos
        const activeInstructors = instructors.filter(instructor => instructor.status === 'activo');
        
        if (activeInstructors.length === 0) {
            instructorSelect.innerHTML += '<option value="" disabled>No hay instructores disponibles</option>';
        } else {
            activeInstructors.forEach(instructor => {
                // Crear texto descriptivo del instructor
                const specialties = instructor.specialties 
                    ? instructor.specialties.map(s => `${s.language} (${s.proficiencyLevel})`).join(', ')
                    : 'Sin especialidades';
                
                const optionText = `${instructor.firstName} ${instructor.lastName} - ${specialties}`;
                const instructorId = `${instructor.firstName} ${instructor.lastName}`;
                
                const option = document.createElement('option');
                option.value = instructorId;
                option.textContent = optionText;
                option.dataset.instructorId = instructor.id;
                option.dataset.specialties = specialties;
                
                instructorSelect.appendChild(option);
            });
        }
        
        // Remover clase de loading
        instructorSelect.classList.remove('loading');
        
        // Agregar event listener para cambios
        instructorSelect.addEventListener('change', () => {
            if (instructorSelect.value) {
                instructorSelect.classList.add('has-value');
            } else {
                instructorSelect.classList.remove('has-value');
            }
        });
    }

    /**
     * Obtiene el instructor seleccionado
     * @returns {Object|null} - Datos del instructor seleccionado
     */
    getSelectedInstructor() {
        const instructorSelect = document.getElementById('course-instructor');
        const selectedOption = instructorSelect.options[instructorSelect.selectedIndex];
        
        if (!selectedOption || !selectedOption.dataset.instructorId) {
            return null;
        }
        
        return {
            id: selectedOption.dataset.instructorId,
            name: selectedOption.value,
            specialties: selectedOption.dataset.specialties
        };
    }
}