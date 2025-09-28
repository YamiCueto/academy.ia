/* ===================================
   REPORTS.JS - Controlador de Reportes
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';
import { COURSES, ATTENDANCE_STATUS } from '../config/constants.js';
import { ChartManager } from '../utils/charts.js';

/**
 * Controlador para reportes y estadísticas
 */
export class ReportsController {
    
    constructor() {
        this.students = [];
        this.attendance = [];
        this.currentReportType = 'daily';
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
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }

        const reportTypeSelect = document.getElementById('report-type');
        if (reportTypeSelect) {
            reportTypeSelect.addEventListener('change', (e) => {
                this.currentReportType = e.target.value;
                this.renderReports();
            });
        }
    }

    onSectionShow() {
        this.loadData();
        this.renderReports();
    }

    renderReports() {
        const content = document.getElementById('reports-content');
        if (!content) return;

        switch (this.currentReportType) {
            case 'daily':
                this.renderDailyReport(content);
                break;
            case 'weekly':
                this.renderWeeklyReport(content);
                break;
            case 'monthly':
                this.renderMonthlyReport(content);
                break;
            case 'course':
                this.renderCourseReport(content);
                break;
            default:
                this.renderDailyReport(content);
        }
    }

    /**
     * Renderiza el reporte diario
     */
    renderDailyReport(container) {
        const today = DateUtils.getCurrentDateForInput();
        const todayAttendance = this.attendance.filter(record => record.date === today);
        
        const stats = this.calculateDailyStats(todayAttendance);
        
        container.innerHTML = `
            <div class="report-section">
                <h4 class="report-title">
                    <i class="fas fa-calendar-day"></i>
                    Reporte Diario - ${DateUtils.formatDate(today)}
                </h4>
                
                <div class="stats-grid">
                    <div class="stat-card stat-present">
                        <div class="stat-value">${stats.present}</div>
                        <div class="stat-label">Presentes</div>
                    </div>
                    <div class="stat-card stat-absent">
                        <div class="stat-value">${stats.absent}</div>
                        <div class="stat-label">Ausentes</div>
                    </div>
                    <div class="stat-card stat-late">
                        <div class="stat-value">${stats.late}</div>
                        <div class="stat-label">Tardanzas</div>
                    </div>
                    <div class="stat-card stat-excused">
                        <div class="stat-value">${stats.excused}</div>
                        <div class="stat-label">Justificados</div>
                    </div>
                </div>

                <div class="report-table-container">
                    <h5>Detalle de Asistencias</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Curso</th>
                                <th>Estado</th>
                                <th>Notas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderAttendanceRows(todayAttendance)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza el reporte semanal
     */
    renderWeeklyReport(container) {
        const weekData = this.getWeeklyData();
        
        container.innerHTML = `
            <div class="report-section">
                <h4 class="report-title">
                    <i class="fas fa-calendar-week"></i>
                    Reporte Semanal - ${weekData.period}
                </h4>

                <div class="chart-container">
                    <div id="weekly-chart" class="chart-container"></div>
                </div>

                <div class="weekly-summary">
                    <h5>Resumen de la Semana</h5>
                    <div class="summary-grid">
                        ${weekData.dailyStats.map(day => `
                            <div class="day-summary">
                                <div class="day-name">${day.dayName}</div>
                                <div class="day-stats">
                                    <span class="present">${day.present}</span> /
                                    <span class="total">${day.total}</span>
                                </div>
                                <div class="day-percentage">${day.percentage}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Renderizar gráfico después de que el DOM esté listo
        setTimeout(() => this.renderWeeklyChart(weekData), 100);
    }

    /**
     * Renderiza el reporte mensual
     */
    renderMonthlyReport(container) {
        const monthData = this.getMonthlyData();
        
        container.innerHTML = `
            <div class="report-section">
                <h4 class="report-title">
                    <i class="fas fa-calendar-alt"></i>
                    Reporte Mensual - ${monthData.period}
                </h4>

                <div class="monthly-overview">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${monthData.totalDays}</div>
                            <div class="stat-label">Días de Clase</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${monthData.averageAttendance}%</div>
                            <div class="stat-label">Asistencia Promedio</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${monthData.totalRecords}</div>
                            <div class="stat-label">Registros Totales</div>
                        </div>
                    </div>
                </div>

                <div class="chart-container">
                    <div id="monthly-trend-chart" class="chart-container"></div>
                </div>

                <div class="student-ranking">
                    <h5>Ranking de Asistencia por Estudiante</h5>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Posición</th>
                                <th>Estudiante</th>
                                <th>Curso</th>
                                <th>Asistencias</th>
                                <th>Porcentaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderStudentRanking(monthData.studentStats)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Renderizar gráfico mensual después de que el DOM esté listo
        setTimeout(() => this.renderMonthlyTrendChart(monthData), 100);
    }

    /**
     * Renderiza el reporte por curso
     */
    renderCourseReport(container) {
        const courseData = this.getCourseData();
        
        container.innerHTML = `
            <div class="report-section">
                <h4 class="report-title">
                    <i class="fas fa-graduation-cap"></i>
                    Reporte por Curso
                </h4>

                <div class="chart-container">
                    <div id="course-comparison-chart" class="chart-container"></div>
                </div>

                <div class="course-comparison">
                    ${Object.entries(courseData).map(([courseKey, data]) => `
                        <div class="course-card">
                            <div class="course-header">
                                <h5>${COURSES[courseKey] || courseKey}</h5>
                                <span class="student-count">${data.totalStudents} estudiantes</span>
                            </div>
                            <div class="course-stats">
                                <div class="stat-row">
                                    <span class="stat-label">Asistencia Promedio:</span>
                                    <span class="stat-value">${data.averageAttendance}%</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Mejor Estudiante:</span>
                                    <span class="stat-value">${data.bestStudent}</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Días Activos:</span>
                                    <span class="stat-value">${data.activeDays}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Renderizar gráfico de comparación de cursos después de que el DOM esté listo
        setTimeout(() => this.renderCourseComparisonChart(courseData), 100);
    }

    /**
     * Calcula estadísticas diarias
     */
    calculateDailyStats(attendanceRecords) {
        const stats = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            total: attendanceRecords.length
        };

        attendanceRecords.forEach(record => {
            switch (record.status) {
                case ATTENDANCE_STATUS.PRESENT:
                    stats.present++;
                    break;
                case ATTENDANCE_STATUS.ABSENT:
                    stats.absent++;
                    break;
                case ATTENDANCE_STATUS.LATE:
                    stats.late++;
                    break;
                case ATTENDANCE_STATUS.EXCUSED:
                    stats.excused++;
                    break;
            }
        });

        return stats;
    }

    /**
     * Obtiene datos de la semana
     */
    getWeeklyData() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const dailyStats = [];
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(weekStart);
            currentDay.setDate(weekStart.getDate() + i);
            const dateString = DateUtils.formatDateForInput(currentDay);
            
            const dayAttendance = this.attendance.filter(record => record.date === dateString);
            const present = dayAttendance.filter(record => record.status === ATTENDANCE_STATUS.PRESENT).length;
            const total = dayAttendance.length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

            dailyStats.push({
                dayName: dayNames[i],
                present,
                total,
                percentage,
                date: dateString
            });
        }

        return {
            period: `${DateUtils.formatDate(weekStart)} - ${DateUtils.formatDate(weekEnd)}`,
            dailyStats
        };
    }

    /**
     * Obtiene datos del mes
     */
    getMonthlyData() {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const monthAttendance = this.attendance.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= monthStart && recordDate <= monthEnd;
        });

        const studentStats = this.calculateStudentStats(monthAttendance);
        const totalRecords = monthAttendance.length;
        const presentRecords = monthAttendance.filter(r => r.status === ATTENDANCE_STATUS.PRESENT).length;
        const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

        // Contar días únicos con registros
        const uniqueDays = new Set(monthAttendance.map(r => r.date)).size;

        return {
            period: monthStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            totalDays: uniqueDays,
            averageAttendance,
            totalRecords,
            studentStats
        };
    }

    /**
     * Obtiene datos por curso
     */
    getCourseData() {
        const courseData = {};

        // Agrupar estudiantes por curso
        const studentsByCourse = {};
        this.students.forEach(student => {
            if (!studentsByCourse[student.course]) {
                studentsByCourse[student.course] = [];
            }
            studentsByCourse[student.course].push(student);
        });

        // Calcular estadísticas por curso
        Object.entries(studentsByCourse).forEach(([course, students]) => {
            const courseAttendance = this.attendance.filter(record => 
                students.some(student => student.id === record.studentId)
            );

            const totalRecords = courseAttendance.length;
            const presentRecords = courseAttendance.filter(r => r.status === ATTENDANCE_STATUS.PRESENT).length;
            const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

            // Encontrar el mejor estudiante del curso
            const studentStats = this.calculateStudentStats(courseAttendance);
            const bestStudent = studentStats.length > 0 ? studentStats[0].name : 'N/A';

            // Días activos
            const activeDays = new Set(courseAttendance.map(r => r.date)).size;

            courseData[course] = {
                totalStudents: students.length,
                averageAttendance,
                bestStudent,
                activeDays
            };
        });

        return courseData;
    }

    /**
     * Calcula estadísticas por estudiante
     */
    calculateStudentStats(attendanceRecords) {
        const studentAttendance = {};

        // Agrupar por estudiante
        attendanceRecords.forEach(record => {
            if (!studentAttendance[record.studentId]) {
                studentAttendance[record.studentId] = {
                    total: 0,
                    present: 0
                };
            }
            studentAttendance[record.studentId].total++;
            if (record.status === ATTENDANCE_STATUS.PRESENT) {
                studentAttendance[record.studentId].present++;
            }
        });

        // Convertir a array y calcular porcentajes
        const stats = Object.entries(studentAttendance).map(([studentId, data]) => {
            const student = this.students.find(s => s.id === parseInt(studentId));
            const percentage = data.total > 0 ? Math.round((data.present / data.total) * 100) : 0;

            return {
                id: parseInt(studentId),
                name: student ? student.name : 'Estudiante no encontrado',
                course: student ? student.course : '',
                present: data.present,
                total: data.total,
                percentage
            };
        });

        // Ordenar por porcentaje descendente
        return stats.sort((a, b) => b.percentage - a.percentage);
    }

    /**
     * Renderiza filas de asistencia
     */
    renderAttendanceRows(attendanceRecords) {
        if (attendanceRecords.length === 0) {
            return '<tr><td colspan="4" class="text-center">No hay registros para este día</td></tr>';
        }

        const statusLabels = {
            present: 'Presente',
            absent: 'Ausente',
            late: 'Tardanza',
            excused: 'Justificado'
        };

        const statusClasses = {
            present: 'status-present',
            absent: 'status-absent',
            late: 'status-late',
            excused: 'status-excused'
        };

        return attendanceRecords.map(record => {
            const student = this.students.find(s => s.id === record.studentId);
            const studentName = student ? student.name : 'Estudiante no encontrado';
            const course = student ? COURSES[student.course] || student.course : '-';

            return `
                <tr>
                    <td>${studentName}</td>
                    <td>${course}</td>
                    <td>
                        <span class="status-badge ${statusClasses[record.status] || ''}">
                            ${statusLabels[record.status] || record.status}
                        </span>
                    </td>
                    <td>${record.notes || '-'}</td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Renderiza ranking de estudiantes
     */
    renderStudentRanking(studentStats) {
        if (studentStats.length === 0) {
            return '<tr><td colspan="5" class="text-center">No hay datos suficientes</td></tr>';
        }

        return studentStats.map((student, index) => `
            <tr>
                <td>
                    <span class="ranking-position">${index + 1}</span>
                </td>
                <td>${student.name}</td>
                <td>${COURSES[student.course] || student.course}</td>
                <td>${student.present}/${student.total}</td>
                <td>
                    <div class="percentage-bar">
                        <div class="percentage-fill" style="width: ${student.percentage}%"></div>
                        <span class="percentage-text">${student.percentage}%</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Renderiza gráfico semanal con Highcharts
     */
    renderWeeklyChart(weekData) {
        const container = document.getElementById('weekly-chart');
        if (!container) return;

        const data = weekData.dailyStats;
        
        if (typeof Highcharts === 'undefined') {
            console.warn('Highcharts no está disponible para el reporte semanal');
            return;
        }

        // Preparar datos para Highcharts
        const categories = data.map(day => day.dayName);
        const percentages = data.map(day => day.percentage);
        const presentData = data.map(day => day.present);
        const totalData = data.map(day => day.total);

        // Configuración del gráfico de barras
        const chartConfig = {
            chart: {
                type: 'column',
                height: 300,
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Asistencia Semanal por Día',
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                }
            },
            xAxis: {
                categories: categories,
                title: {
                    text: 'Días de la Semana'
                }
            },
            yAxis: [{
                title: {
                    text: 'Porcentaje de Asistencia (%)',
                    style: {
                        color: '#667eea'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#667eea'
                    }
                },
                max: 100,
                min: 0
            }, {
                title: {
                    text: 'Número de Estudiantes',
                    style: {
                        color: '#10b981'
                    }
                },
                labels: {
                    style: {
                        color: '#10b981'
                    }
                },
                opposite: true
            }],
            series: [{
                name: 'Porcentaje de Asistencia',
                type: 'column',
                yAxis: 0,
                data: percentages.map((percentage, index) => ({
                    y: percentage,
                    color: percentage >= 80 ? '#10b981' : 
                           percentage >= 60 ? '#f59e0b' : '#ef4444'
                })),
                dataLabels: {
                    enabled: true,
                    format: '{y}%',
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textOutline: '1px contrast'
                    }
                },
                tooltip: {
                    pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}%</b><br/>'
                }
            }, {
                name: 'Estudiantes Presentes',
                type: 'line',
                yAxis: 1,
                data: presentData,
                color: '#8b5cf6',
                marker: {
                    symbol: 'circle',
                    radius: 4
                },
                tooltip: {
                    pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y}</b><br/>'
                }
            }],
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e5e7eb',
                borderRadius: 8,
                shadow: true
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    borderWidth: 0
                },
                line: {
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 4
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        yAxis: [{
                            title: {
                                text: 'Asistencia (%)'
                            }
                        }, {
                            title: {
                                text: 'Estudiantes'
                            }
                        }],
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        };

        // Crear el gráfico
        Highcharts.chart(container, chartConfig);
    }

    /**
     * Renderiza gráfico de tendencia mensual con Highcharts
     */
    renderMonthlyTrendChart(monthData) {
        const container = document.getElementById('monthly-trend-chart');
        if (!container) return;

        if (typeof Highcharts === 'undefined') {
            console.warn('Highcharts no está disponible para el reporte mensual');
            return;
        }

        // Obtener datos de tendencia mensual (últimos 30 días)
        const trendData = this.getMonthlyTrendData();

        const chartConfig = {
            chart: {
                type: 'area',
                height: 350,
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Tendencia de Asistencia Mensual',
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                }
            },
            xAxis: {
                categories: trendData.dates,
                title: {
                    text: 'Fecha'
                },
                labels: {
                    rotation: -45
                }
            },
            yAxis: {
                title: {
                    text: 'Porcentaje de Asistencia (%)'
                },
                min: 0,
                max: 100,
                labels: {
                    format: '{value}%'
                }
            },
            series: [{
                name: 'Asistencia (%)',
                data: trendData.percentages,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, 'rgba(102, 126, 234, 0.8)'],
                        [1, 'rgba(102, 126, 234, 0.1)']
                    ]
                },
                color: '#667eea',
                lineWidth: 3,
                marker: {
                    radius: 4,
                    fillColor: '#667eea',
                    states: {
                        hover: {
                            radius: 6
                        }
                    }
                }
            }],
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e5e7eb',
                borderRadius: 8,
                shadow: true,
                pointFormat: '<span style="color:{series.color}">●</span> {series.name}: <b>{point.y}%</b><br/>'
            },
            plotOptions: {
                area: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        xAxis: {
                            labels: {
                                rotation: -90
                            }
                        }
                    }
                }]
            }
        };

        Highcharts.chart(container, chartConfig);
    }

    /**
     * Renderiza gráfico de comparación de cursos con Highcharts
     */
    renderCourseComparisonChart(courseData) {
        const container = document.getElementById('course-comparison-chart');
        if (!container) return;

        if (typeof Highcharts === 'undefined') {
            console.warn('Highcharts no está disponible para el reporte por curso');
            return;
        }

        // Preparar datos para el gráfico
        const courses = Object.keys(courseData);
        const coursesNames = courses.map(key => COURSES[key] || key);
        const attendanceData = courses.map(key => courseData[key].averageAttendance);
        const studentsData = courses.map(key => courseData[key].totalStudents);

        const chartConfig = {
            chart: {
                type: 'column',
                height: 400,
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Comparación de Cursos',
                style: {
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                }
            },
            xAxis: {
                categories: coursesNames,
                title: {
                    text: 'Cursos'
                },
                labels: {
                    rotation: -45,
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yAxis: [{
                title: {
                    text: 'Porcentaje de Asistencia (%)',
                    style: {
                        color: '#10b981'
                    }
                },
                labels: {
                    format: '{value}%',
                    style: {
                        color: '#10b981'
                    }
                },
                max: 100,
                min: 0
            }, {
                title: {
                    text: 'Número de Estudiantes',
                    style: {
                        color: '#667eea'
                    }
                },
                labels: {
                    style: {
                        color: '#667eea'
                    }
                },
                opposite: true
            }],
            series: [{
                name: 'Asistencia Promedio (%)',
                type: 'column',
                yAxis: 0,
                data: attendanceData.map(percentage => ({
                    y: percentage,
                    color: percentage >= 85 ? '#10b981' : 
                           percentage >= 70 ? '#f59e0b' : '#ef4444'
                })),
                dataLabels: {
                    enabled: true,
                    format: '{y}%',
                    style: {
                        fontWeight: 'bold',
                        color: 'white',
                        textOutline: '1px contrast'
                    }
                }
            }, {
                name: 'Total de Estudiantes',
                type: 'spline',
                yAxis: 1,
                data: studentsData,
                color: '#667eea',
                lineWidth: 3,
                marker: {
                    symbol: 'circle',
                    radius: 5,
                    fillColor: '#667eea'
                }
            }],
            tooltip: {
                shared: true,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e5e7eb',
                borderRadius: 8,
                shadow: true
            },
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                borderWidth: 0
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    borderWidth: 0
                }
            },
            credits: {
                enabled: false
            },
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        };

        Highcharts.chart(container, chartConfig);
    }

    /**
     * Obtiene datos de tendencia mensual para el gráfico de área
     */
    getMonthlyTrendData() {
        const today = new Date();
        const dates = [];
        const percentages = [];
        
        // Obtener datos de los últimos 15 días
        for (let i = 14; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = DateUtils.formatDateForInput(date);
            const dayName = DateUtils.formatDate(date, { day: 'numeric', month: 'short' });
            
            const dayAttendance = this.attendance.filter(record => record.date === dateStr);
            const present = dayAttendance.filter(record => record.status === ATTENDANCE_STATUS.PRESENT).length;
            const total = dayAttendance.length;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            
            dates.push(dayName);
            percentages.push(percentage);
        }
        
        return {
            dates,
            percentages
        };
    }

    /**
     * Exporta el reporte actual
     */
    exportReport() {
        const reportData = this.generateReportData();
        const csv = this.convertToCSV(reportData);
        this.downloadCSV(csv, `reporte_${this.currentReportType}_${DateUtils.getCurrentDateForInput()}.csv`);
    }

    /**
     * Genera datos del reporte para exportación
     */
    generateReportData() {
        switch (this.currentReportType) {
            case 'daily':
                return this.generateDailyReportData();
            case 'weekly':
                return this.generateWeeklyReportData();
            case 'monthly':
                return this.generateMonthlyReportData();
            case 'course':
                return this.generateCourseReportData();
            default:
                return [];
        }
    }

    generateDailyReportData() {
        const today = DateUtils.getCurrentDateForInput();
        const todayAttendance = this.attendance.filter(record => record.date === today);
        
        return todayAttendance.map(record => {
            const student = this.students.find(s => s.id === record.studentId);
            return {
                'Fecha': DateUtils.formatDate(record.date),
                'Estudiante': student ? student.name : 'N/A',
                'Curso': student ? COURSES[student.course] || student.course : 'N/A',
                'Estado': record.status,
                'Notas': record.notes || ''
            };
        });
    }

    generateWeeklyReportData() {
        const weekData = this.getWeeklyData();
        return weekData.dailyStats.map(day => ({
            'Día': day.dayName,
            'Fecha': day.date,
            'Presentes': day.present,
            'Total': day.total,
            'Porcentaje': `${day.percentage}%`
        }));
    }

    generateMonthlyReportData() {
        const monthData = this.getMonthlyData();
        return monthData.studentStats.map((student, index) => ({
            'Posición': index + 1,
            'Estudiante': student.name,
            'Curso': COURSES[student.course] || student.course,
            'Presentes': student.present,
            'Total': student.total,
            'Porcentaje': `${student.percentage}%`
        }));
    }

    generateCourseReportData() {
        const courseData = this.getCourseData();
        return Object.entries(courseData).map(([courseKey, data]) => ({
            'Curso': COURSES[courseKey] || courseKey,
            'Total Estudiantes': data.totalStudents,
            'Asistencia Promedio': `${data.averageAttendance}%`,
            'Mejor Estudiante': data.bestStudent,
            'Días Activos': data.activeDays
        }));
    }

    /**
     * Convierte datos a CSV
     */
    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapar comillas y envolver en comillas si contiene comas
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            }).join(',')
        );

        return [csvHeaders, ...csvRows].join('\n');
    }

    /**
     * Descarga archivo CSV
     */
    downloadCSV(csv, filename) {
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}