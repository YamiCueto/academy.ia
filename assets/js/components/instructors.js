/**
 * Controlador para la gestión de instructores
 * Maneja el CRUD completo de instructores con especialidades por idiomas
 */

import { StorageManager } from '../utils/storage.js';
import { MESSAGES } from '../config/constants.js';

export class InstructorsController {
    constructor() {
        this.instructors = [];
        this.currentInstructor = null;
        this.filteredInstructors = [];
        this.languages = ['Inglés', 'Francés', 'Alemán', 'Portugués', 'Italiano', 'Japonés', 'Chino'];
        this.cefr_levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        
        this.init();
    }

    /**
     * Inicializa el controlador
     */
    init() {
        this.loadData();
        this.attachEventListeners();
        this.renderInstructorsTable();
    }

    /**
     * Carga los datos desde localStorage
     */
    loadData() {
        this.instructors = StorageManager.getInstructors();
        this.filteredInstructors = [...this.instructors];
        
        console.log('📋 Instructores cargados:', this.instructors.length);
        
        // Si no hay instructores, crear uno de ejemplo con especialidades
        if (this.instructors.length === 0) {
            console.log('⚠️ No hay instructores, creando ejemplo...');
            this.createSampleInstructor();
        } else {
            // Verificar que el instructor tenga especialidades
            this.instructors.forEach((instructor, index) => {
                console.log(`👨‍🏫 Instructor ${index + 1}: ${instructor.firstName} ${instructor.lastName}`);
                console.log(`🏷️ Especialidades:`, instructor.specialties);
            });
        }
    }

    /**
     * Adjunta los event listeners
     */
    attachEventListeners() {
        // Botón agregar instructor
        document.getElementById('add-instructor')?.addEventListener('click', () => {
            this.showModal();
        });

        // Cerrar modal
        document.getElementById('close-instructor-modal')?.addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('cancel-instructor')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Formulario de instructor
        document.getElementById('instructor-form')?.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Filtros
        document.getElementById('instructor-search')?.addEventListener('input', () => {
            this.filterInstructors();
        });

        document.getElementById('instructor-language-filter')?.addEventListener('change', () => {
            this.filterInstructors();
        });

        document.getElementById('instructor-status-filter')?.addEventListener('change', () => {
            this.filterInstructors();
        });

        // Agregar especialidad
        document.getElementById('add-specialty')?.addEventListener('click', () => {
            this.addSpecialtyField();
        });

        // Validación email en tiempo real
        document.getElementById('instructor-email')?.addEventListener('blur', (e) => {
            this.validateEmail(e.target.value);
        });

        // Escuchar cuando se carga la sección
        document.addEventListener('section-changed', (e) => {
            if (e.detail.section === 'instructors') {
                this.onSectionLoad();
            }
        });
    }

    /**
     * Se ejecuta cuando se carga la sección de instructores
     */
    onSectionLoad() {
        this.loadData();
        // Si no hay instructores, crear uno de prueba
        if (this.instructors.length === 0) {
            this.createSampleInstructor();
        }
        this.renderInstructorsTable();
    }

    /**
     * Crea un instructor de ejemplo si no hay ninguno
     */
    createSampleInstructor() {
        const sampleInstructor = {
            id: "INS-001",
            employeeId: "INS-001",
            firstName: "Juan David",
            lastName: "De Leon Rivas",
            email: "deleon@gmail.com",
            phone: "3008786798",
            status: "activo",
            hireDate: "2020-01-15",
            experience: 10,
            bio: "Instructor experimentado en idiomas con certificaciones internacionales",
            specialties: [
                {
                    language: "Inglés",
                    proficiencyLevel: "C2",
                    yearsExperience: 8,
                    certifications: "TESOL, CELTA",
                    teachingLevels: ["A1", "A2", "B1", "B2", "C1", "C2"]
                },
                {
                    language: "Francés", 
                    proficiencyLevel: "B2",
                    yearsExperience: 5,
                    certifications: "DELF",
                    teachingLevels: ["A1", "A2", "B1", "B2"]
                },
                {
                    language: "Español",
                    proficiencyLevel: "C2", 
                    yearsExperience: 10,
                    certifications: "Nativo",
                    teachingLevels: ["A1", "A2", "B1", "B2", "C1", "C2"]
                }
            ],
            certifications: "TESOL Certificate, CELTA, DELF B2",
            activeCourses: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.instructors.push(sampleInstructor);
        StorageManager.saveInstructors(this.instructors);
        this.filteredInstructors = [...this.instructors];
        
        console.log('✅ Instructor de ejemplo creado con especialidades:', sampleInstructor.specialties);
    }

    /**
     * Muestra el modal para agregar/editar instructor
     * @param {Object} instructor - Instructor a editar (opcional)
     */
    showModal(instructor = null) {
        const modal = document.getElementById('instructor-modal');
        const title = document.getElementById('instructor-modal-title');
        const saveButton = document.getElementById('save-instructor-text');
        
        if (instructor) {
            // Modo edición
            this.currentInstructor = instructor;
            title.textContent = 'Editar Instructor';
            saveButton.textContent = 'Actualizar Instructor';
            this.fillForm(instructor);
        } else {
            // Modo agregar
            this.currentInstructor = null;
            title.textContent = 'Agregar Instructor';
            saveButton.textContent = 'Guardar Instructor';
            this.clearForm();
        }

        // Inicializar especialidades
        this.initSpecialtiesSection();
        
        modal.classList.add('active');
        document.getElementById('instructor-first-name').focus();
    }

    /**
     * Oculta el modal
     */
    hideModal() {
        const modal = document.getElementById('instructor-modal');
        modal.classList.remove('active');
        this.clearForm();
        this.clearErrors();
        this.currentInstructor = null;
    }

    /**
     * Inicializa la sección de especialidades
     */
    initSpecialtiesSection() {
        const container = document.getElementById('specialties-container');
        container.innerHTML = '';

        if (this.currentInstructor && this.currentInstructor.specialties && this.currentInstructor.specialties.length > 0) {
            // Cargar especialidades existentes
            this.currentInstructor.specialties.forEach((specialty, index) => {
                this.addSpecialtyField(specialty, index);
            });
        } else {
            // Agregar una especialidad vacía por defecto
            this.addSpecialtyField();
        }
    }

    /**
     * Agrega un campo de especialidad
     * @param {Object} specialty - Datos de especialidad existente (opcional)
     * @param {number} index - Índice de la especialidad
     */
    addSpecialtyField(specialty = null, index = null) {
        const container = document.getElementById('specialties-container');
        const specialtyIndex = index !== null ? index : container.children.length;
        
        const specialtyDiv = document.createElement('div');
        specialtyDiv.className = 'specialty-item';
        specialtyDiv.dataset.index = specialtyIndex;
        
        specialtyDiv.innerHTML = `
            <div class="specialty-header">
                <h5>Especialidad ${specialtyIndex + 1}</h5>
                ${specialtyIndex > 0 ? `<button type="button" class="btn btn-sm btn-danger remove-specialty" data-index="${specialtyIndex}">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Idioma *</label>
                    <select name="specialties[${specialtyIndex}][language]" class="form-select specialty-language" required>
                        <option value="">Seleccionar idioma</option>
                        ${this.languages.map(lang => `
                            <option value="${lang}" ${specialty && specialty.language === lang ? 'selected' : ''}>${lang}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Nivel de Competencia *</label>
                    <select name="specialties[${specialtyIndex}][proficiencyLevel]" class="form-select" required>
                        <option value="">Seleccionar nivel</option>
                        ${this.cefr_levels.map(level => `
                            <option value="${level}" ${specialty && specialty.proficiencyLevel === level ? 'selected' : ''}>${level}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Años de Experiencia en este Idioma</label>
                    <input type="number" 
                           name="specialties[${specialtyIndex}][yearsExperience]"
                           class="form-input" 
                           placeholder="3"
                           min="0" 
                           max="50"
                           value="${specialty ? specialty.yearsExperience || '' : ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Certificaciones Específicas</label>
                    <input type="text" 
                           name="specialties[${specialtyIndex}][certifications]"
                           class="form-input" 
                           placeholder="Ej: CELTA, TESOL"
                           maxlength="200"
                           value="${specialty ? specialty.certifications || '' : ''}">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Niveles que puede enseñar</label>
                <div class="checkbox-group">
                    ${this.cefr_levels.map(level => `
                        <label class="checkbox-item">
                            <input type="checkbox" 
                                   name="specialties[${specialtyIndex}][teachingLevels][]"
                                   value="${level}"
                                   ${specialty && specialty.teachingLevels && specialty.teachingLevels.includes(level) ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            ${level}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.appendChild(specialtyDiv);

        // Agregar event listener para eliminar especialidad
        const removeBtn = specialtyDiv.querySelector('.remove-specialty');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                this.removeSpecialtyField(e.target.dataset.index);
            });
        }
    }

    /**
     * Elimina un campo de especialidad
     * @param {number} index - Índice de la especialidad a eliminar
     */
    removeSpecialtyField(index) {
        const container = document.getElementById('specialties-container');
        const specialtyItem = container.querySelector(`[data-index="${index}"]`);
        if (specialtyItem) {
            specialtyItem.remove();
            this.updateSpecialtyIndexes();
        }
    }

    /**
     * Actualiza los índices de las especialidades después de eliminar una
     */
    updateSpecialtyIndexes() {
        const container = document.getElementById('specialties-container');
        const items = container.querySelectorAll('.specialty-item');
        
        items.forEach((item, newIndex) => {
            item.dataset.index = newIndex;
            item.querySelector('.specialty-header h5').textContent = `Especialidad ${newIndex + 1}`;
            
            // Actualizar nombres de los campos
            const inputs = item.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.name.includes('specialties[')) {
                    const fieldName = input.name.match(/\[(\w+)\]/g)[1];
                    input.name = input.name.replace(/\[\d+\]/, `[${newIndex}]`);
                }
            });
        });
    }

    /**
     * Llena el formulario con los datos del instructor
     * @param {Object} instructor - Datos del instructor
     */
    fillForm(instructor) {
        // Información personal
        document.getElementById('instructor-first-name').value = instructor.firstName || '';
        document.getElementById('instructor-last-name').value = instructor.lastName || '';
        document.getElementById('instructor-email').value = instructor.email || '';
        document.getElementById('instructor-phone').value = instructor.phone || '';
        document.getElementById('instructor-birth-date').value = instructor.birthDate || '';
        document.getElementById('instructor-nationality').value = instructor.nationality || '';
        document.getElementById('instructor-address').value = instructor.address || '';
        
        // Información profesional
        document.getElementById('instructor-employee-id').value = instructor.employeeId || '';
        document.getElementById('instructor-hire-date').value = instructor.hireDate || '';
        document.getElementById('instructor-experience').value = instructor.experience || '';
        document.getElementById('instructor-status').value = instructor.status || 'activo';
        document.getElementById('instructor-bio').value = instructor.bio || '';
        
        // Certificaciones
        document.getElementById('instructor-certifications').value = instructor.certifications || '';
    }

    /**
     * Limpia el formulario
     */
    clearForm() {
        document.getElementById('instructor-form').reset();
        document.getElementById('instructor-status').value = 'activo';
        
        // Limpiar especialidades
        const container = document.getElementById('specialties-container');
        container.innerHTML = '';
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
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        
        // Procesar datos básicos
        const instructorData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim().toLowerCase(),
            phone: formData.get('phone') ? formData.get('phone').trim() : '',
            birthDate: formData.get('birthDate') || null,
            nationality: formData.get('nationality') ? formData.get('nationality').trim() : '',
            address: formData.get('address') ? formData.get('address').trim() : '',
            employeeId: formData.get('employeeId') ? formData.get('employeeId').trim().toUpperCase() : '',
            hireDate: formData.get('hireDate') || null,
            experience: parseInt(formData.get('experience')) || 0,
            status: formData.get('status') || 'activo',
            bio: formData.get('bio') ? formData.get('bio').trim() : '',
            certifications: formData.get('certifications') ? formData.get('certifications').trim() : ''
        };

        // Procesar especialidades
        instructorData.specialties = this.processSpecialties(formData);

        // Validar datos
        if (!await this.validateInstructorData(instructorData)) {
            return;
        }

        if (this.currentInstructor) {
            this.updateInstructor(instructorData);
        } else {
            this.addInstructor(instructorData);
        }
    }

    /**
     * Procesa las especialidades del formulario
     * @param {FormData} formData - Datos del formulario
     * @returns {Array} Array de especialidades
     */
    processSpecialties(formData) {
        const specialties = [];
        const specialtyItems = document.querySelectorAll('.specialty-item');
        
        specialtyItems.forEach((item, index) => {
            const language = formData.get(`specialties[${index}][language]`);
            const proficiencyLevel = formData.get(`specialties[${index}][proficiencyLevel]`);
            
            if (language && proficiencyLevel) {
                const teachingLevels = formData.getAll(`specialties[${index}][teachingLevels][]`);
                
                specialties.push({
                    language,
                    proficiencyLevel,
                    yearsExperience: parseInt(formData.get(`specialties[${index}][yearsExperience]`)) || 0,
                    certifications: formData.get(`specialties[${index}][certifications]`) || '',
                    teachingLevels: teachingLevels || []
                });
            }
        });
        
        return specialties;
    }

    /**
     * Valida los datos del instructor
     * @param {Object} instructorData - Datos del instructor
     * @returns {Promise<boolean>} - True si los datos son válidos
     */
    async validateInstructorData(instructorData) {
        let isValid = true;
        this.clearErrors();

        // Validar nombre
        if (!instructorData.firstName) {
            this.showError('firstName', 'El nombre es obligatorio');
            isValid = false;
        }

        // Validar apellido
        if (!instructorData.lastName) {
            this.showError('lastName', 'El apellido es obligatorio');
            isValid = false;
        }

        // Validar email
        if (!instructorData.email) {
            this.showError('email', 'El email es obligatorio');
            isValid = false;
        } else if (!this.isValidEmail(instructorData.email)) {
            this.showError('email', 'Ingrese un email válido');
            isValid = false;
        } else if (this.isDuplicateEmail(instructorData.email)) {
            this.showError('email', 'Ya existe un instructor con este email');
            isValid = false;
        }

        // Validar ID empleado si se proporciona
        if (instructorData.employeeId && this.isDuplicateEmployeeId(instructorData.employeeId)) {
            this.showError('employeeId', 'Ya existe un instructor con este ID');
            isValid = false;
        }

        // Validar especialidades
        if (!instructorData.specialties || instructorData.specialties.length === 0) {
            window.app.showAlert('Debe agregar al menos una especialidad en idiomas', 'warning');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si es válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Verifica si el email ya existe
     * @param {string} email - Email a verificar
     * @returns {boolean} - True si está duplicado
     */
    isDuplicateEmail(email) {
        return this.instructors.some(instructor => 
            instructor.email === email && 
            (!this.currentInstructor || instructor.id !== this.currentInstructor.id)
        );
    }

    /**
     * Verifica si el ID de empleado ya existe
     * @param {string} employeeId - ID a verificar
     * @returns {boolean} - True si está duplicado
     */
    isDuplicateEmployeeId(employeeId) {
        return this.instructors.some(instructor => 
            instructor.employeeId === employeeId && 
            (!this.currentInstructor || instructor.id !== this.currentInstructor.id)
        );
    }

    /**
     * Valida email en tiempo real
     * @param {string} email - Email a validar
     */
    validateEmail(email) {
        if (!email) {
            this.hideError('email');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('email', 'Formato de email inválido');
            return;
        }

        if (this.isDuplicateEmail(email)) {
            this.showError('email', 'Email ya registrado');
            return;
        }

        this.hideError('email');
    }

    /**
     * Muestra un error en el formulario
     * @param {string} field - Campo con error
     * @param {string} message - Mensaje de error
     */
    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(`instructor-${field}`);
        
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
        const inputElement = document.getElementById(`instructor-${field}`);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }

    /**
     * Agrega un nuevo instructor
     * @param {Object} instructorData - Datos del instructor
     */
    addInstructor(instructorData) {
        const newInstructor = {
            id: Date.now(),
            ...instructorData,
            activeCourses: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.instructors.push(newInstructor);
        StorageManager.saveInstructors(this.instructors);
        this.loadData();
        this.renderInstructorsTable();
        this.hideModal();

        // Disparar evento
        document.dispatchEvent(new CustomEvent('instructor-added', {
            detail: { instructor: newInstructor }
        }));

        this.showMessage(`Instructor ${newInstructor.firstName} ${newInstructor.lastName} agregado correctamente`, 'success');
    }

    /**
     * Actualiza un instructor existente
     * @param {Object} instructorData - Datos del instructor
     */
    updateInstructor(instructorData) {
        const index = this.instructors.findIndex(i => i.id === this.currentInstructor.id);
        if (index === -1) return;

        this.instructors[index] = {
            ...this.currentInstructor,
            ...instructorData,
            updatedAt: new Date().toISOString()
        };

        StorageManager.saveInstructors(this.instructors);
        this.loadData();
        this.renderInstructorsTable();
        this.hideModal();

        // Disparar evento
        document.dispatchEvent(new CustomEvent('instructor-updated', {
            detail: { instructor: this.instructors[index] }
        }));

        this.showMessage(`Instructor ${instructorData.firstName} ${instructorData.lastName} actualizado correctamente`, 'success');
    }

    /**
     * Elimina un instructor
     * @param {number} instructorId - ID del instructor
     */
    async deleteInstructor(instructorId) {
        const instructor = this.instructors.find(i => i.id === instructorId);
        if (!instructor) return;

        const confirmed = await window.app.showConfirm(
            'Eliminar Instructor',
            `¿Estás seguro de eliminar al instructor ${instructor.firstName} ${instructor.lastName}? Esta acción no se puede deshacer.`,
            'Sí, eliminar',
            'Cancelar',
            'delete'
        );

        if (confirmed) {
            this.instructors = this.instructors.filter(i => i.id !== instructorId);
            StorageManager.saveInstructors(this.instructors);
            this.loadData();
            this.renderInstructorsTable();

            // Disparar evento
            document.dispatchEvent(new CustomEvent('instructor-deleted', {
                detail: { instructorId }
            }));

            window.app.showAlert(`Instructor ${instructor.firstName} ${instructor.lastName} eliminado correctamente`, 'success');
        }
    }

    /**
     * Filtra los instructores según los criterios seleccionados
     */
    filterInstructors() {
        const searchTerm = document.getElementById('searchInstructors')?.value.toLowerCase() || '';
        const languageFilter = document.getElementById('filterSpecialty')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';

        this.filteredInstructors = this.instructors.filter(instructor => {
            const matchesSearch = 
                `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(searchTerm) ||
                instructor.email.toLowerCase().includes(searchTerm) ||
                (instructor.employeeId && instructor.employeeId.toLowerCase().includes(searchTerm));
            
            const matchesLanguage = !languageFilter || 
                (instructor.specialties && instructor.specialties.some(specialty => 
                    specialty.language && specialty.language.toLowerCase().includes(languageFilter.toLowerCase())
                ));
            
            const matchesStatus = !statusFilter || instructor.status === statusFilter;

            return matchesSearch && matchesLanguage && matchesStatus;
        });

        this.renderInstructorsTable();
    }

    /**
     * Renderiza la tabla de instructores con la estructura completa
     */
    renderInstructorsTable() {
        const instructorsContainer = document.getElementById('instructors-container');
        if (!instructorsContainer) return;

        // Generar estructura completa
        let html = `
            <div class="instructors-header">
                <h2 class="instructors-title">
                    <i class="fas fa-users"></i> Gestión de Instructores
                </h2>
                <button class="btn-add-instructor" onclick="window.instructorsController.showModal()">
                    <i class="fas fa-plus"></i> Agregar Instructor
                </button>
            </div>
            
            <div class="instructors-controls">
                <div class="row">
                    <div class="col-md-4">
                        <div class="instructors-search">
                            <input 
                                type="text" 
                                id="searchInstructors" 
                                placeholder="Buscar instructor..."
                                oninput="window.instructorsController.filterInstructors()"
                            >
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select 
                            id="filterSpecialty" 
                            class="filter-select" 
                            onchange="window.instructorsController.filterInstructors()"
                        >
                            <option value="">Todos los idiomas</option>
                            <option value="inglés">Inglés</option>
                            <option value="español">Español</option>
                            <option value="francés">Francés</option>
                            <option value="alemán">Alemán</option>
                            <option value="italiano">Italiano</option>
                            <option value="portugués">Portugués</option>
                            <option value="chino">Chino</option>
                            <option value="japonés">Japonés</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <select 
                            id="filterStatus" 
                            class="filter-select" 
                            onchange="window.instructorsController.filterInstructors()"
                        >
                            <option value="">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                            <option value="vacaciones">Vacaciones</option>
                            <option value="licencia">Licencia</option>
                        </select>
                    </div>
                </div>
            </div>
        `;

        if (this.filteredInstructors.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">👨‍🏫</div>
                    <h3>No hay instructores registrados</h3>
                    <p>Comienza agregando tu primer instructor al sistema</p>
                    <button class="btn-add-instructor" onclick="window.instructorsController.showModal()">
                        <i class="fas fa-plus"></i> Agregar Primer Instructor
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
                                <th>Teléfono</th>
                                <th>Especialidades</th>
                                <th>Experiencia</th>
                                <th>Cursos Activos</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.filteredInstructors.forEach(instructor => {
                // Generar iniciales para el avatar
                const fullName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Usuario';
                const initials = fullName.split(' ')
                    .map(name => name.charAt(0).toUpperCase())
                    .slice(0, 2)
                    .join('');

                // Renderizar especialidades
                const specialties = instructor.specialties || [];
                console.log(`👨‍🏫 ${instructor.firstName} tiene ${specialties.length} especialidades:`, specialties);
                
                const specialtiesHTML = specialties.length > 0 
                    ? specialties.map(spec => {
                        const language = spec.language || 'Idioma';
                        const level = spec.proficiencyLevel || 'A1';
                        console.log(`🏷️ Generando badge: ${language} (${level})`);
                        return `<span class="badge-specialty">${language} (${level})</span>`;
                    }).join('')
                    : '<span class="text-muted" style="font-style: italic; color: #a0aec0; font-size: 0.85rem;">Sin especialidades</span>';

                html += `
                    <tr>
                        <td>
                            <div class="instructor-avatar">
                                ${initials || '?'}
                            </div>
                        </td>
                        <td>
                            <div class="instructor-name">
                                <strong>${instructor.firstName || 'N/A'} ${instructor.lastName || ''}</strong>
                                ${instructor.employeeId ? `<small>ID: ${instructor.employeeId}</small>` : ''}
                            </div>
                        </td>
                        <td>
                            <a href="mailto:${instructor.email || ''}" class="email-link">
                                ${instructor.email || 'Sin email'}
                            </a>
                        </td>
                        <td>
                            ${instructor.phone || 'No especificado'}
                        </td>
                        <td>
                            <div class="specialties-list">
                                ${specialtiesHTML}
                            </div>
                        </td>
                        <td>
                            <span class="experience-badge">
                                ${instructor.experience || 0} año${(instructor.experience || 0) !== 1 ? 's' : ''}
                            </span>
                        </td>
                        <td>
                            <div class="courses-count">
                                ${instructor.activeCourses || 0}
                            </div>
                        </td>
                        <td>
                            <span class="badge-status badge-${instructor.status || 'activo'}">
                                ${this.getStatusText(instructor.status)}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-outline" 
                                        onclick="window.instructorsController.showModal(${JSON.stringify(instructor).replace(/"/g, '&quot;')})"
                                        title="Editar instructor"
                                        aria-label="Editar instructor ${instructor.firstName} ${instructor.lastName}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-danger" 
                                        onclick="window.instructorsController.deleteInstructor(${instructor.id})"
                                        title="Eliminar instructor"
                                        aria-label="Eliminar instructor ${instructor.firstName} ${instructor.lastName}">
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

        instructorsContainer.innerHTML = html;
    }

    /**
     * Obtiene el texto del estado
     * @param {string} status - Estado del instructor
     * @returns {string} - Texto del estado
     */
    getStatusText(status) {
        const statusTexts = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'vacaciones': 'Vacaciones',
            'licencia': 'Licencia'
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
     * Obtiene un instructor por su ID
     * @param {number} instructorId - ID del instructor
     * @returns {Object|null} - Instructor encontrado o null
     */
    getInstructorById(instructorId) {
        return this.instructors.find(instructor => instructor.id === instructorId) || null;
    }

    /**
     * Obtiene instructores activos
     * @returns {Array} - Array de instructores activos
     */
    getActiveInstructors() {
        return this.instructors.filter(instructor => instructor.status === 'activo');
    }

    /**
     * Obtiene instructores por idioma
     * @param {string} language - Idioma a buscar
     * @returns {Array} - Array de instructores que enseñan el idioma
     */
    getInstructorsByLanguage(language) {
        return this.instructors.filter(instructor => 
            instructor.specialties.some(specialty => specialty.language === language)
        );
    }

    /**
     * Obtiene estadísticas de instructores
     * @returns {Object} - Objeto con estadísticas
     */
    getInstructorsStats() {
        const stats = {
            total: this.instructors.length,
            active: this.instructors.filter(i => i.status === 'activo').length,
            inactive: this.instructors.filter(i => i.status === 'inactivo').length,
            onVacation: this.instructors.filter(i => i.status === 'vacaciones').length,
            languages: {}
        };

        // Contar especialidades por idioma
        this.instructors.forEach(instructor => {
            instructor.specialties.forEach(specialty => {
                if (!stats.languages[specialty.language]) {
                    stats.languages[specialty.language] = 0;
                }
                stats.languages[specialty.language]++;
            });
        });

        return stats;
    }
}