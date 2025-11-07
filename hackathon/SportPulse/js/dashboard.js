import { TaskManager } from './taskManager.js';

export class DashboardManager {
    static updateTaskSelect() {
        const select = document.getElementById('focusTask');
        if (!select) return;

        const tasks = TaskManager.getActiveTasks();
        
        select.innerHTML = `
            <option value="">Select a task to focus on</option>
            ${tasks.map(t => `
                <option value="${t.id}">
                    ${t.title}
                </option>
            `).join('')}
        `;

        if (tasks.length === 0) {
            select.innerHTML = '<option value="">No tasks available</option>';
        }
    }

    static updateTimer(duration = 25) {
        const timer = document.getElementById('focusTimer');
        if (timer) {
            const minutes = Math.floor(duration);
            timer.textContent = `${String(minutes).padStart(2, '0')}:00`;
        }
    }

    static handleTaskChange(taskId) {
        const task = TaskManager.getTaskById(parseInt(taskId));
        if (task) {
            this.updateTimer(task.duration);
            this.updateTaskInfo(task);
        }
    }

    static updateTaskInfo(task) {
        const durationEl = document.getElementById('taskDuration');
        const priorityEl = document.getElementById('taskPriority');

        if (durationEl) {
            durationEl.textContent = `Duration: ${task.duration} min`;
        }
        if (priorityEl) {
            priorityEl.textContent = `Priority: ${task.priority}`;
        }
    }

    static initialize() {
        this.updateTaskSelect();
        
        const focusTask = document.getElementById('focusTask');
        if (focusTask) {
            focusTask.addEventListener('change', (e) => {
                if (e.target.value) {
                    this.handleTaskChange(e.target.value);
                }
            });
        }

        // Listen for task updates
        window.addEventListener('tasksUpdated', () => {
            this.updateTaskSelect();
        });
    }
}

// Initialize dashboard features
document.addEventListener('DOMContentLoaded', () => {
    DashboardManager.initialize();
});
