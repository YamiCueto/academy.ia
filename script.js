// Academia de Idiomas - Sistema de Control de Asistencias
// Clase principal para manejar toda la aplicación

class AttendanceSystem {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.attendance = JSON.parse(localStorage.getItem('attendance')) || [];
        this.courses = [
            'ingles-basico',
            'ingles-intermedio',
            'ingles-avanzado',
            'ingles-conversacion',
            'toefl-prep'
        ];
        this.courseNames = {
            'ingles-basico': 'Inglés Básico',
            'ingles-intermedio': 'Inglés Intermedio',
            'ingles-avanzado': 'Inglés Avanzado',
            'ingles-conversacion': 'Inglés Conversación',
            'toefl-prep': 'Preparación TOEFL'
        };
        
        this.init();
    }

    init() {
        this.loadInitialData();
        this.setupEventListeners();
        this.updateCurrentDate();
        this.showSection('dashboard');
        this.updateDashboard();
    }

    // Carga datos iniciales si no existen
    loadInitialData() {
        if (this.students.length === 0) {
            this.students = [
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
                    enrollmentDate: '2024-02-01'
                },
                {
                    id: 3,
                    name: 'María López',
                    email: 'maria.lopez@email.com',
                    phone: '+57 302 345 6789',
                    course: 'ingles-avanzado',
                    level: 'C1',
                    enrollmentDate: '2024-01-20'
                }
            ];
            this.saveStudents();
        }

        if (this.attendance.length === 0) {
            // Generar algunos datos de ejemplo con notas más detalladas
            const today = new Date();
            const sampleNotes = [
                'Excelente participación en clase. Mostró gran interés en el tema de conversación.',
                'Llegó 10 minutos tarde pero se integró bien a la clase. Buen nivel de comprensión.',
                'Participó activamente en los ejercicios de pronunciación. Necesita reforzar gramática.',
                'Muy buena actitud, hizo todas las tareas. Destaca en ejercicios de listening.',
                'Se notó un poco distraído hoy. Recomiendo practicar más en casa.',
                'Excelente progreso en speaking. Ya puede mantener conversaciones fluidas.',
                '',
                'Faltó a la clase anterior pero se puso al día rápidamente.',
                'Participación sobresaliente en role-play. Gran mejora en confianza.',
                'Tuvo dificultades con el tema de verbos irregulares. Se le asignó práctica extra.'
            ];
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                
                this.students.forEach(student => {
                    if (Math.random() > 0.2) { // 80% de probabilidad de asistencia
                        const status = Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'late' : 'excused');
                        const note = Math.random() > 0.3 ? sampleNotes[Math.floor(Math.random() * sampleNotes.length)] : '';
                        
                        this.attendance.push({
                            id: Date.now() + Math.random(),
                            studentId: student.id,
                            course: student.course,
                            date: date.toISOString().split('T')[0],
                            status: status,
                            notes: note,
                            timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
                        });
                    }
                });
            }
            this.saveAttendance();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación del menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Botón de asistencia rápida
        document.getElementById('quick-attendance').addEventListener('click', () => {
            this.showSection('attendance');
        });

        // Formulario de asistencia
        document.getElementById('attendance-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addAttendance();
        });

        // Modal de estudiante
        document.getElementById('add-student-btn').addEventListener('click', () => {
            this.showStudentModal();
        });

        document.getElementById('student-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStudent();
        });

        // Cerrar modal
        document.querySelector('.close').addEventListener('click', () => {
            this.hideStudentModal();
        });

        document.getElementById('cancel-student').addEventListener('click', () => {
            this.hideStudentModal();
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            const studentModal = document.getElementById('student-modal');
            const attendanceModal = document.getElementById('attendance-detail-modal');
            if (e.target === studentModal) {
                this.hideStudentModal();
            }
            if (e.target === attendanceModal) {
                this.hideAttendanceDetailModal();
            }
        });

        // Cerrar modal de detalles de asistencia
        document.getElementById('close-attendance-detail').addEventListener('click', () => {
            this.hideAttendanceDetailModal();
        });

        // Filtros de reportes
        document.getElementById('period-filter').addEventListener('change', (e) => {
            const customDates = document.querySelector('.custom-dates');
            if (e.target.value === 'custom') {
                customDates.style.display = 'flex';
            } else {
                customDates.style.display = 'none';
            }
        });

        document.getElementById('generate-report').addEventListener('click', () => {
            this.generateReport();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportReport();
        });

        // Filtros de asistencia
        document.getElementById('filter-btn').addEventListener('click', () => {
            this.filterAttendance();
        });

        // Establecer fecha actual por defecto
        document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('date-filter').value = new Date().toISOString().split('T')[0];
    }

    // Mostrar sección específica
    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover clase activa de todos los menús
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Mostrar sección seleccionada
        document.getElementById(`${sectionName}-section`).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Actualizar título
        const titles = {
            'dashboard': 'Dashboard',
            'students': 'Estudiantes',
            'attendance': 'Control de Asistencias',
            'reports': 'Reportes'
        };
        document.getElementById('page-title').textContent = titles[sectionName];

        // Cargar datos específicos de la sección
        switch (sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'students':
                this.loadStudentsTable();
                break;
            case 'attendance':
                this.loadAttendanceForm();
                this.loadTodayAttendance();
                break;
            case 'reports':
                break;
        }
    }

    // Actualizar fecha actual
    updateCurrentDate() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('es-ES', options);
    }

    // Dashboard
    updateDashboard() {
        this.updateStats();
        this.updateRecentActivity();
        this.drawAttendanceChart();
    }

    updateStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = this.attendance.filter(record => record.date === today);
        const totalStudents = this.students.length;
        const todayPresent = todayAttendance.filter(record => 
            record.status === 'present' || record.status === 'late').length;
        
        // Calcular tasa de asistencia de la última semana
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekAttendance = this.attendance.filter(record => 
            new Date(record.date) >= lastWeek);
        const totalPossibleAttendance = totalStudents * 7;
        const actualAttendance = lastWeekAttendance.filter(record => 
            record.status === 'present' || record.status === 'late').length;
        const attendanceRate = totalPossibleAttendance > 0 ? 
            Math.round((actualAttendance / totalPossibleAttendance) * 100) : 0;

        document.getElementById('total-students').textContent = totalStudents;
        document.getElementById('today-attendance').textContent = todayPresent;
        document.getElementById('attendance-rate').textContent = `${attendanceRate}%`;
        document.getElementById('active-classes').textContent = this.courses.length;
    }

    updateRecentActivity() {
        const recentActivity = document.getElementById('recent-activity-list');
        const sortedAttendance = [...this.attendance]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        recentActivity.innerHTML = '';
        sortedAttendance.forEach(record => {
            const student = this.students.find(s => s.id === record.studentId);
            if (student) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${student.name}</strong> - ${this.getStatusText(record.status)}
                    <span class="activity-time">${this.formatDate(record.date)}</span>
                `;
                recentActivity.appendChild(li);
            }
        });
    }

    drawAttendanceChart() {
        const canvas = document.getElementById('attendanceChart');
        const ctx = canvas.getContext('2d');
        
        // Obtener datos de los últimos 7 días
        const days = [];
        const attendanceCounts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayAttendance = this.attendance.filter(record => 
                record.date === dateStr && 
                (record.status === 'present' || record.status === 'late')
            ).length;
            
            days.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
            attendanceCounts.push(dayAttendance);
        }

        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configuración del gráfico
        const padding = 40;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        const maxValue = Math.max(...attendanceCounts, 1);
        
        // Dibujar ejes
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.stroke();
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();
        
        // Dibujar barras
        const barWidth = chartWidth / days.length;
        ctx.fillStyle = '#4f46e5';
        
        attendanceCounts.forEach((count, index) => {
            const barHeight = (count / maxValue) * chartHeight;
            const x = padding + (index * barWidth) + (barWidth * 0.1);
            const y = padding + chartHeight - barHeight;
            
            ctx.fillRect(x, y, barWidth * 0.8, barHeight);
            
            // Etiquetas de días
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(days[index], x + (barWidth * 0.4), padding + chartHeight + 20);
            
            // Valores
            ctx.fillText(count.toString(), x + (barWidth * 0.4), y - 5);
            
            ctx.fillStyle = '#4f46e5';
        });
    }

    // Gestión de estudiantes
    loadStudentsTable() {
        const tbody = document.getElementById('students-tbody');
        tbody.innerHTML = '';

        if (this.students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                        <i class="fas fa-user-graduate" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        No hay estudiantes registrados. 
                        <button class="btn btn-primary btn-sm" onclick="attendanceSystem.showStudentModal()" style="margin-left: 0.5rem;">
                            Agregar primer estudiante
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        this.students.forEach((student, index) => {
            const row = document.createElement('tr');
            const attendanceCount = this.attendance.filter(a => a.studentId === student.id).length;
            const recentAttendance = this.attendance.filter(a => 
                a.studentId === student.id && 
                new Date(a.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            ).length;
            
            row.innerHTML = `
                <td><strong>#${String(index + 1).padStart(3, '0')}</strong></td>
                <td>
                    <div class="student-info">
                        <strong>${student.name}</strong>
                        ${recentAttendance > 0 ? '<span class="activity-indicator active" title="Activo esta semana"></span>' : '<span class="activity-indicator inactive" title="Sin actividad reciente"></span>'}
                    </div>
                </td>
                <td>${student.email}</td>
                <td>
                    <span class="course-badge">${this.courseNames[student.course]}</span>
                </td>
                <td>
                    <span class="level-badge level-${student.level.toLowerCase()}">${student.level}</span>
                </td>
                <td>${this.formatDate(student.enrollmentDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" onclick="attendanceSystem.editStudent(${student.id})" title="Editar estudiante">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="attendanceSystem.deleteStudent(${student.id})" title="Eliminar estudiante">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="attendance-count" title="Total de asistencias registradas">
                        <small>${attendanceCount} registros</small>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showStudentModal() {
        document.getElementById('student-modal').style.display = 'block';
        document.getElementById('student-form').reset();
        document.querySelector('#student-modal h2').textContent = 'Agregar Nuevo Estudiante';
        document.querySelector('#student-form button[type="submit"]').textContent = 'Guardar Estudiante';
        document.getElementById('student-form').dataset.editId = '';
    }

    showEditStudentModal(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        document.getElementById('student-modal').style.display = 'block';
        document.querySelector('#student-modal h2').textContent = 'Editar Estudiante';
        document.querySelector('#student-form button[type="submit"]').textContent = 'Actualizar Estudiante';
        document.getElementById('student-form').dataset.editId = studentId;

        // Llenar el formulario con los datos del estudiante
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-phone').value = student.phone || '';
        document.getElementById('student-course').value = student.course;
        document.getElementById('student-level').value = student.level;
    }

    hideStudentModal() {
        document.getElementById('student-modal').style.display = 'none';
    }

    // Modal de detalles de asistencia
    showAttendanceDetail(record, student) {
        const modal = document.getElementById('attendance-detail-modal');
        const content = document.getElementById('attendance-detail-content');
        
        const timestamp = record.timestamp ? new Date(record.timestamp) : new Date();
        const timeString = timestamp.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        content.innerHTML = `
            <div class="attendance-detail-info">
                <div class="detail-row">
                    <span class="detail-label">Estudiante:</span>
                    <span class="detail-value">${student.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${student.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Curso:</span>
                    <span class="detail-value">${this.courseNames[record.course]}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Nivel:</span>
                    <span class="detail-value">${student.level}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Fecha:</span>
                    <span class="detail-value">${this.formatDate(record.date)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hora de Registro:</span>
                    <span class="detail-value">${timeString}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Estado:</span>
                    <span class="detail-value">
                        <span class="attendance-status status-${record.status} status-badge-large">
                            ${this.getStatusText(record.status)}
                        </span>
                    </span>
                </div>
            </div>
            
            <div class="notes-section">
                <h4><i class="fas fa-sticky-note"></i> Observaciones del Tutor</h4>
                <div class="notes-content">
                    ${record.notes && record.notes.trim() 
                        ? record.notes 
                        : '<span class="no-notes">No hay observaciones registradas para esta sesión.</span>'
                    }
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    hideAttendanceDetailModal() {
        document.getElementById('attendance-detail-modal').style.display = 'none';
    }

    addStudent() {
        const name = document.getElementById('student-name').value.trim();
        const email = document.getElementById('student-email').value.trim();
        const phone = document.getElementById('student-phone').value.trim();
        const course = document.getElementById('student-course').value;
        const level = document.getElementById('student-level').value;
        const editId = document.getElementById('student-form').dataset.editId;

        // Validar campos requeridos
        if (!name || !email || !course || !level) {
            this.showNotification('Por favor complete todos los campos requeridos', 'warning');
            return;
        }

        // Validar email único (excepto si estamos editando el mismo estudiante)
        const existingStudent = this.students.find(s => 
            s.email.toLowerCase() === email.toLowerCase() && 
            s.id !== parseInt(editId)
        );
        
        if (existingStudent) {
            this.showNotification('Ya existe un estudiante con este email', 'warning');
            return;
        }

        if (editId) {
            // Editando estudiante existente
            const studentIndex = this.students.findIndex(s => s.id === parseInt(editId));
            if (studentIndex !== -1) {
                this.students[studentIndex] = {
                    ...this.students[studentIndex],
                    name: name,
                    email: email,
                    phone: phone,
                    course: course,
                    level: level
                };
                this.showNotification('Estudiante actualizado exitosamente', 'success');
            }
        } else {
            // Agregando nuevo estudiante
            const newStudent = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                course: course,
                level: level,
                enrollmentDate: new Date().toISOString().split('T')[0]
            };
            this.students.push(newStudent);
            this.showNotification('Estudiante agregado exitosamente', 'success');
        }

        this.saveStudents();
        this.loadStudentsTable();
        this.updateAttendanceSelects();
        this.updateDashboard(); // Actualizar dashboard después de cambios
        this.hideStudentModal();
    }

    deleteStudent(studentId) {
        const student = this.students.find(s => s.id === studentId);
        if (!student) return;

        const confirmMessage = `¿Está seguro de que desea eliminar a "${student.name}"?\n\nEsta acción también eliminará todos los registros de asistencia asociados y no se puede deshacer.`;
        
        if (confirm(confirmMessage)) {
            // Contar registros de asistencia que se eliminarán
            const attendanceCount = this.attendance.filter(a => a.studentId === studentId).length;
            
            this.students = this.students.filter(s => s.id !== studentId);
            this.attendance = this.attendance.filter(a => a.studentId !== studentId);
            this.saveStudents();
            this.saveAttendance();
            this.loadStudentsTable();
            this.updateAttendanceSelects();
            this.updateDashboard(); // Actualizar dashboard después de eliminar
            
            const message = attendanceCount > 0 
                ? `Estudiante eliminado exitosamente (${attendanceCount} registros de asistencia también eliminados)`
                : 'Estudiante eliminado exitosamente';
            
            this.showNotification(message, 'success');
        }
    }

    editStudent(studentId) {
        this.showEditStudentModal(studentId);
    }

    // Control de asistencias
    loadAttendanceForm() {
        this.updateAttendanceSelects();
    }

    updateAttendanceSelects() {
        const studentSelect = document.getElementById('student-select');
        const courseSelect = document.getElementById('course-select');
        const courseFilter = document.getElementById('course-filter');

        // Actualizar select de estudiantes
        studentSelect.innerHTML = '<option value="">Seleccionar estudiante</option>';
        this.students.forEach(student => {
            studentSelect.innerHTML += `<option value="${student.id}">${student.name}</option>`;
        });

        // Actualizar select de cursos
        courseSelect.innerHTML = '<option value="">Seleccionar curso</option>';
        courseFilter.innerHTML = '<option value="">Todos los cursos</option>';
        this.courses.forEach(course => {
            const option = `<option value="${course}">${this.courseNames[course]}</option>`;
            courseSelect.innerHTML += option;
            courseFilter.innerHTML += option;
        });
    }

    addAttendance() {
        const studentId = parseInt(document.getElementById('student-select').value);
        const course = document.getElementById('course-select').value;
        const date = document.getElementById('attendance-date').value;
        const status = document.getElementById('attendance-status').value;
        const notes = document.getElementById('notes').value;

        // Verificar si ya existe un registro para este estudiante en esta fecha
        const existingRecord = this.attendance.find(record => 
            record.studentId === studentId && 
            record.date === date && 
            record.course === course
        );

        if (existingRecord) {
            if (confirm('Ya existe un registro de asistencia para este estudiante en esta fecha. ¿Desea actualizarlo?')) {
                existingRecord.status = status;
                existingRecord.notes = notes;
            } else {
                return;
            }
        } else {
            const newAttendance = {
                id: Date.now(),
                studentId: studentId,
                course: course,
                date: date,
                status: status,
                notes: notes,
                timestamp: new Date().toISOString()
            };
            this.attendance.push(newAttendance);
        }

        this.saveAttendance();
        this.loadTodayAttendance();
        document.getElementById('attendance-form').reset();
        document.getElementById('attendance-date').value = new Date().toISOString().split('T')[0];
        
        this.showNotification('Asistencia registrada exitosamente', 'success');
    }

    loadTodayAttendance() {
        const today = new Date().toISOString().split('T')[0];
        const todayRecords = this.attendance.filter(record => record.date === today);
        
        const container = document.getElementById('today-attendance-list');
        container.innerHTML = '';

        if (todayRecords.length === 0) {
            container.innerHTML = '<p class="text-center">No hay registros de asistencia para hoy.</p>';
            return;
        }

        todayRecords.forEach(record => {
            const student = this.students.find(s => s.id === record.studentId);
            if (student) {
                const div = document.createElement('div');
                div.className = 'attendance-record';
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    this.showAttendanceDetail(record, student);
                });
                div.innerHTML = `
                    <div class="record-info">
                        <div class="student-name">${student.name}</div>
                        <div class="course-name">${this.courseNames[record.course]}</div>
                    </div>
                    <div class="attendance-status status-${record.status}">
                        ${this.getStatusText(record.status)}
                    </div>
                `;
                container.appendChild(div);
            }
        });
    }

    filterAttendance() {
        const course = document.getElementById('course-filter').value;
        const date = document.getElementById('date-filter').value;
        
        let filteredRecords = this.attendance;
        
        if (course) {
            filteredRecords = filteredRecords.filter(record => record.course === course);
        }
        
        if (date) {
            filteredRecords = filteredRecords.filter(record => record.date === date);
        }
        
        this.displayFilteredAttendance(filteredRecords);
    }

    displayFilteredAttendance(records) {
        const container = document.getElementById('today-attendance-list');
        container.innerHTML = '';

        if (records.length === 0) {
            container.innerHTML = '<p class="text-center">No se encontraron registros con los filtros seleccionados.</p>';
            return;
        }

        records.forEach(record => {
            const student = this.students.find(s => s.id === record.studentId);
            if (student) {
                const div = document.createElement('div');
                div.className = 'attendance-record';
                div.style.cursor = 'pointer';
                div.addEventListener('click', () => {
                    this.showAttendanceDetail(record, student);
                });
                div.innerHTML = `
                    <div class="record-info">
                        <div class="student-name">${student.name}</div>
                        <div class="course-name">${this.courseNames[record.course]} - ${this.formatDate(record.date)}</div>
                    </div>
                    <div class="attendance-status status-${record.status}">
                        ${this.getStatusText(record.status)}
                    </div>
                `;
                container.appendChild(div);
            }
        });
    }

    // Reportes
    generateReport() {
        const period = document.getElementById('period-filter').value;
        let startDate, endDate;
        
        const today = new Date();
        
        switch (period) {
            case 'week':
                startDate = new Date(today);
                startDate.setDate(today.getDate() - 7);
                endDate = today;
                break;
            case 'month':
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 1);
                endDate = today;
                break;
            case 'quarter':
                startDate = new Date(today);
                startDate.setMonth(today.getMonth() - 3);
                endDate = today;
                break;
            case 'custom':
                startDate = new Date(document.getElementById('start-date').value);
                endDate = new Date(document.getElementById('end-date').value);
                break;
        }

        const reportData = this.generateReportData(startDate, endDate);
        this.displayReport(reportData, startDate, endDate);
    }

    generateReportData(startDate, endDate) {
        const filteredAttendance = this.attendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startDate && recordDate <= endDate;
        });

        const reportData = {
            totalRecords: filteredAttendance.length,
            presentCount: filteredAttendance.filter(r => r.status === 'present').length,
            absentCount: filteredAttendance.filter(r => r.status === 'absent').length,
            lateCount: filteredAttendance.filter(r => r.status === 'late').length,
            excusedCount: filteredAttendance.filter(r => r.status === 'excused').length,
            studentStats: {}
        };

        // Estadísticas por estudiante
        this.students.forEach(student => {
            const studentAttendance = filteredAttendance.filter(r => r.studentId === student.id);
            reportData.studentStats[student.id] = {
                name: student.name,
                course: this.courseNames[student.course],
                total: studentAttendance.length,
                present: studentAttendance.filter(r => r.status === 'present').length,
                absent: studentAttendance.filter(r => r.status === 'absent').length,
                late: studentAttendance.filter(r => r.status === 'late').length,
                excused: studentAttendance.filter(r => r.status === 'excused').length
            };
        });

        return reportData;
    }

    displayReport(reportData, startDate, endDate) {
        const container = document.getElementById('report-results');
        
        const attendanceRate = reportData.totalRecords > 0 ? 
            Math.round(((reportData.presentCount + reportData.lateCount) / reportData.totalRecords) * 100) : 0;

        container.innerHTML = `
            <div class="report-header">
                <h3>Reporte de Asistencia</h3>
                <p>Período: ${this.formatDate(startDate.toISOString().split('T')[0])} - ${this.formatDate(endDate.toISOString().split('T')[0])}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-stats">
                    <div class="summary-stat">
                        <h4>${reportData.totalRecords}</h4>
                        <p>Total Registros</p>
                    </div>
                    <div class="summary-stat">
                        <h4>${reportData.presentCount}</h4>
                        <p>Presentes</p>
                    </div>
                    <div class="summary-stat">
                        <h4>${reportData.absentCount}</h4>
                        <p>Ausentes</p>
                    </div>
                    <div class="summary-stat">
                        <h4>${attendanceRate}%</h4>
                        <p>Tasa de Asistencia</p>
                    </div>
                </div>
            </div>
            
            <div class="student-report-table">
                <h4>Detalle por Estudiante</h4>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Curso</th>
                            <th>Total</th>
                            <th>Presente</th>
                            <th>Ausente</th>
                            <th>Tarde</th>
                            <th>Justificado</th>
                            <th>% Asistencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.values(reportData.studentStats).map(student => {
                            const studentRate = student.total > 0 ? 
                                Math.round(((student.present + student.late) / student.total) * 100) : 0;
                            return `
                                <tr>
                                    <td>${student.name}</td>
                                    <td>${student.course}</td>
                                    <td>${student.total}</td>
                                    <td class="text-success">${student.present}</td>
                                    <td class="text-danger">${student.absent}</td>
                                    <td class="text-warning">${student.late}</td>
                                    <td>${student.excused}</td>
                                    <td><strong>${studentRate}%</strong></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    exportReport() {
        const reportContainer = document.getElementById('report-results');
        if (!reportContainer.innerHTML.trim()) {
            this.showNotification('Primero genere un reporte', 'warning');
            return;
        }

        // Crear CSV con los datos del reporte
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Estudiante,Curso,Total,Presente,Ausente,Tarde,Justificado,Porcentaje Asistencia\n";
        
        // Obtener datos de la tabla
        const table = reportContainer.querySelector('.data-table tbody');
        if (table) {
            Array.from(table.rows).forEach(row => {
                const rowData = Array.from(row.cells).map(cell => 
                    cell.textContent.replace(/,/g, ';')
                ).join(',');
                csvContent += rowData + "\n";
            });
        }

        // Descargar archivo
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_asistencia_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Reporte exportado exitosamente', 'success');
    }

    // Utilidades
    getStatusText(status) {
        const statusTexts = {
            'present': 'Presente',
            'absent': 'Ausente',
            'late': 'Tarde',
            'excused': 'Justificado'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    saveAttendance() {
        localStorage.setItem('attendance', JSON.stringify(this.attendance));
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        // Colores según el tipo
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        // Mostrar notificación
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Inicializar la aplicación cuando se carga la página
let attendanceSystem;
document.addEventListener('DOMContentLoaded', () => {
    attendanceSystem = new AttendanceSystem();
});

// Agregar estilos adicionales para el reporte
const additionalStyles = `
    .report-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .report-summary {
        margin-bottom: 2rem;
    }

    .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .summary-stat {
        background-color: var(--background-color);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        text-align: center;
    }

    .summary-stat h4 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .summary-stat p {
        color: var(--text-secondary);
        font-size: 0.875rem;
    }

    .student-report-table {
        margin-top: 2rem;
    }

    .student-report-table h4 {
        margin-bottom: 1rem;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .btn-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
        margin-right: 0.5rem;
    }
`;

// Agregar estilos al head
const styleSheet = document.createElement("style");
styleSheet.innerText = additionalStyles;
document.head.appendChild(styleSheet);