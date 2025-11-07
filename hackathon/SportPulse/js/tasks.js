export function getTasks() {
    return JSON.parse(localStorage.getItem('flosparc_tasks')) || [];
}

export function addTask(taskData) {
    const tasks = getTasks();
    const task = {
        ...taskData,
        id: Date.now(),
        created: new Date().toISOString(),
        completed: false,
        duration: parseInt(taskData.duration),
        priority: taskData.priority || 'medium'
    };
    tasks.push(task);
    localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
    return task;
}

export function toggleTaskComplete(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
        window.dispatchEvent(new Event('tasksUpdated'));
    }
}

export function deleteTask(taskId) {
    const tasks = getTasks().filter(t => t.id !== parseInt(taskId));
    localStorage.setItem('flosparc_tasks', JSON.stringify(tasks));
    window.dispatchEvent(new Event('tasksUpdated'));
}

export function getTaskById(taskId) {
    return getTasks().find(t => t.id === parseInt(taskId)) || null;
}

export function getActiveTasks() {
    return getTasks().filter(t => !t.completed);
}

export function getTodaysTasks() {
    const today = new Date().toISOString().split('T')[0];
    return getTasks()
        .filter(t => t.deadline === today)
        .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
}

export function getPriorityTasks() {
    return getActiveTasks()
        .sort((a, b) => b.priority.localeCompare(a.priority))
        .slice(0, 2);
}

export function calculateDailyProgress() {
    const tasks = getTasks();
    const completed = tasks.filter(t => t.completed).reduce((sum, t) => sum + (t.duration || 0), 0);
    const total = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
    return {
        completed: Math.floor(completed / 60),
        total: Math.ceil(total / 60),
        percentage: total ? (completed / total) * 100 : 0
    };
}
