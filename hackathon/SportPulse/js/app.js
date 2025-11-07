// Color Picker functionality
const colorPicker = document.querySelector('.color-picker');
const colorPickerBtn = document.getElementById('colorPickerBtn');

colorPickerBtn.addEventListener('click', () => {
    colorPicker.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!colorPicker.contains(e.target)) {
        colorPicker.classList.remove('active');
    }
});

// Sound Effects with actual URLs
const sounds = {
    hover: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-soft-bell-tada-567.mp3'),
    switch: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3'),
    ambient: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-ethereal-fairy-win-sound-2019.mp3')
};

// Initialize sounds
Object.values(sounds).forEach(sound => {
    sound.load();
    if (sound === sounds.ambient) {
        sound.loop = true;
        sound.volume = 0.3;
    }
});

// Setup volume control
const volumeControl = document.getElementById('volumeControl');
const soundToggle = document.getElementById('soundToggle');

volumeControl.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    Object.values(sounds).forEach(sound => {
        sound.volume = volume;
    });
});

// Sound toggle with icon update
soundToggle.addEventListener('click', function() {
    this.classList.toggle('active');
    if (this.classList.contains('active')) {
        sounds.ambient.play();
        this.querySelector('svg').innerHTML = `
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z"/>`;
    } else {
        sounds.ambient.pause();
        this.querySelector('svg').innerHTML = `
            <path d="M10 3.5v13L4.5 12H2V8h2.5L10 3.5zM12 7v6a3 3 0 000-6z"/>`;
    }
});

// Add hover sounds to nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
        if (soundToggle.classList.contains('active')) {
            sounds.hover.currentTime = 0;
            sounds.hover.play();
        }
    });
});

// User info logic
document.addEventListener("DOMContentLoaded", function () {
    // Get user from localStorage (simulate login)
    const user = JSON.parse(localStorage.getItem("flosparc_user")) || { name: "User", avatar: "U" };
    const userName = document.getElementById("userName");
    const userAvatar = document.getElementById("userAvatar");
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.avatar || (user.name ? user.name[0] : "U");
});

// Highlight active nav item
const navLinks = document.querySelectorAll(".nav-item");
navLinks.forEach(link => {
    if (link.href && window.location.pathname.endsWith(link.getAttribute("href"))) {
        link.classList.add("active", "bg-white/10");
    } else {
        link.classList.remove("active", "bg-white/10");
    }
});

// --- Centralized Notification/Toast System (ARIA live for accessibility) ---
function showNotification(msg) {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.position = 'fixed';
        container.style.bottom = '2rem';
        container.style.right = '2rem';
        container.style.zIndex = 9999;
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    const n = document.createElement('div');
    n.textContent = msg;
    n.style.background = 'linear-gradient(90deg,#4C6FFF,#8A5CFF)';
    n.style.color = '#fff';
    n.style.padding = '1rem 2rem';
    n.style.marginTop = '0.5rem';
    n.style.borderRadius = '1rem';
    n.style.boxShadow = '0 2px 12px #0003';
    n.style.fontWeight = 'bold';
    n.style.fontSize = '1rem';
    n.setAttribute('role', 'alert');
    container.appendChild(n);
    setTimeout(() => n.remove(), 2000);
}

// --- Profile stats updater (unified for all pages) ---
function updateProfileStats() {
    // Tasks today
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const today = todayStr();
    const tasksToday = tasks.filter(t => t.date === today).length;
    const tasksTodayEl = document.getElementById('tasksToday');
    if (tasksTodayEl) tasksTodayEl.textContent = tasksToday;

    // Mood entries this week
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 6);
    const moodsThisWeek = moods.filter(m => new Date(m.date) >= weekAgo).length;
    const moodCountEl = document.getElementById('moodCount');
    if (moodCountEl) moodCountEl.textContent = moodsThisWeek;

    // Sleep last night
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    let lastSleep = sleepLogs.length ? sleepLogs[sleepLogs.length-1] : null;
    let sleepHours = lastSleep ? lastSleep.hours : 0;
    const sleepHoursEl = document.getElementById('sleepHours');
    if (sleepHoursEl) sleepHoursEl.textContent = sleepHours + 'h';

    // Productivity Score (simple: avg of completion)
    let prodScore = 0;
    if (tasks.length) {
        const completed = tasks.filter(t => t.completed).length;
        prodScore = Math.round((completed / tasks.length) * 100);
    }
    const prodScoreEl = document.getElementById('prodScore');
    if (prodScoreEl) prodScoreEl.textContent = prodScore + '%';
    // Animate SVG circle
    const circle = document.getElementById('prodScoreCircle');
    if (circle) {
        const total = 282.74;
        circle.setAttribute('stroke-dashoffset', total - (prodScore/100)*total);
    }
}

// --- Add Task ---
function addTask(taskText) {
    if (!taskText.trim()) return;
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push({ text: taskText, date: todayStr(), completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showNotification('Task added!');
    updateProfileStats();
    window.dispatchEvent(new Event('storage'));
}

// --- Add Mood ---
function addMood(moodText) {
    if (!moodText.trim()) return;
    const moods = JSON.parse(localStorage.getItem('moods') || '[]');
    moods.push({ text: moodText, date: todayStr() });
    localStorage.setItem('moods', JSON.stringify(moods));
    showNotification('Mood shared!');
    updateProfileStats();
    window.dispatchEvent(new Event('storage'));
}

// --- Add Sleep ---
function addSleep(bedtime, waketime) {
    // bedtime, waketime: "HH:mm"
    if (!bedtime || !waketime) return;
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = waketime.split(':').map(Number);
    let start = new Date();
    start.setHours(bH, bM, 0, 0);
    let end = new Date();
    end.setHours(wH, wM, 0, 0);
    if (end <= start) end.setDate(end.getDate() + 1); // next day
    const hours = Math.round(((end - start) / (1000*60*60)) * 10) / 10;
    const sleepLogs = JSON.parse(localStorage.getItem('sleepLogs') || '[]');
    sleepLogs.push({
        date: todayStr(),
        bedtime,
        waketime,
        hours
    });
    localStorage.setItem('sleepLogs', JSON.stringify(sleepLogs));
    showNotification('Sleep data uploaded to FloSparc!');
    updateProfileStats();
    window.dispatchEvent(new Event('storage'));
}

// --- Attach to buttons if present ---
document.addEventListener('DOMContentLoaded', function() {
    // Add Task
    const addTaskBtn = document.querySelector('#addTaskBtn');
    const taskInput = document.querySelector('#taskInput');
    if (addTaskBtn && taskInput) {
        addTaskBtn.onclick = function() {
            addTask(taskInput.value);
            taskInput.value = '';
        };
    }
    // Add Mood
    const addMoodBtn = document.querySelector('#addMoodBtn');
    const moodInput = document.querySelector('#moodInput');
    if (addMoodBtn && moodInput) {
        addMoodBtn.onclick = function() {
            addMood(moodInput.value);
            moodInput.value = '';
        };
    }
    // Add Sleep
    const addSleepBtn = document.querySelector('#addSleepBtn');
    const bedtimeInput = document.querySelector('#bedtimeInput');
    const waketimeInput = document.querySelector('#waketimeInput');
    if (addSleepBtn && bedtimeInput && waketimeInput) {
        addSleepBtn.onclick = function() {
            addSleep(bedtimeInput.value, waketimeInput.value);
            bedtimeInput.value = '';
            waketimeInput.value = '';
        };
    }
    // Initial stats update
    updateProfileStats();
});

// Listen for storage changes and update stats everywhere
window.addEventListener('storage', updateProfileStats);
