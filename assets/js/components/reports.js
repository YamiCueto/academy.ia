/* ===================================
   REPORTS.JS - Controlador de Reportes
   =================================== */

import { StorageManager } from '../utils/storage.js';
import { DateUtils } from '../utils/date-utils.js';

/**
 * Controlador para reportes y estadísticas
 */
export class ReportsController {
    
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
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
    }

    onSectionShow() {
        this.loadData();
        this.renderReports();
    }

    renderReports() {
        const content = document.getElementById('reports-content');
        if (content) {
            content.innerHTML = `
                <div class="card">
                    <div class="card-content">
                        <h4>Reportes disponibles próximamente</h4>
                        <p>Esta sección contendrá reportes detallados de asistencia.</p>
                    </div>
                </div>
            `;
        }
    }

    exportReport() {
        console.log('Exportando reporte...');
    }
}