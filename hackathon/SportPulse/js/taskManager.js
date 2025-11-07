export class TaskManager {
    static getTasks() {
        return JSON.parse(localStorage.getItem('flosparc_tasks')) || [];
    }

    static addTask(task) {
        const tasks = this.getTasks();
        task.id = Date.now();
        task.created = new Date().toISOString();
        task.completed = false;
        task.duration = parseInt(task.duration) || 25; // Default 25 min if not set
        task.priority = task.priority || 'medium';
        tasks.push(task);
        localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
        this.notifyChange();
    }

    static updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
            this.notifyChange();
        }
    }

    static getTaskById(id) {
        return this.getTasks().find(t => t.id === parseInt(id));
    }

    static getActiveTasks() {
        return this.getTasks()
            .filter(t => !t.completed)
            .sort((a, b) => b.priority.localeCompare(a.priority));
    }

    static completeTask(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === parseInt(id));
        if (task) {
            task.completed = true;
            task.completedAt = new Date().toISOString();
            localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
            this.notifyChange();
        }
    }

    static notifyChange() {
        window.dispatchEvent(new Event('tasksUpdated'));
    }
}
