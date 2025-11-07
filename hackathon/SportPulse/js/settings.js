// Settings Management
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.setupEventListeners();
        this.initializeUI();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('flosparc_settings')) || {
            theme: 'dark',
            customTheme: {
                primary: '#4C6FFF',
                secondary: '#8A5CFF',
                accent: '#23235b'
            },
            layout: 'comfortable',
            notifications: {
                tasks: true,
                wellness: true,
                achievements: true,
                community: true,
                quietHours: {
                    start: '22:00',
                    end: '07:00'
                }
            },
            privacy: {
                profileVisibility: 'public',
                journalPrivacy: 'friends',
                activityVisibility: 'selected'
            },
            productivity: {
                defaultView: 'board',
                autoSchedule: true,
                pomodoro: {
                    workDuration: 25,
                    breakDuration: 5,
                    autoStartBreaks: true
                }
            },
            accessibility: {
                highContrast: false,
                reduceMotion: false,
                fontSize: 16,
                screenReader: false
            },
            integrations: {
                googleCalendar: false,
                appleHealth: false,
                spotify: false,
                fitbit: false
            },
            ai: {
                suggestions: true,
                wellness: true,
                focus: true
            },
            experimental: {
                voiceControl: false,
                moodAnalysis: true
            }
        };
    }

    saveSettings() {
        localStorage.setItem('flosparc_settings', JSON.stringify(this.settings));
        this.showSaveConfirmation();
    }

    setupEventListeners() {
        // Theme Settings
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleThemeChange(btn.dataset.theme));
        });

        // Color Pickers
        ['primary', 'secondary', 'accent'].forEach(color => {
            const picker = document.getElementById(`${color}-color`);
            if (picker) {
                picker.value = this.settings.customTheme[color];
                picker.addEventListener('change', () => {
                    this.settings.customTheme[color] = picker.value;
                    this.applyCustomTheme();
                });
            }
        });

        // Layout
        const layoutSelect = document.getElementById('layout-style');
        if (layoutSelect) {
            layoutSelect.value = this.settings.layout;
            layoutSelect.addEventListener('change', () => {
                this.settings.layout = layoutSelect.value;
                this.applyLayout();
            });
        }

        // Notifications
        ['task', 'wellness', 'achievement', 'community'].forEach(type => {
            const checkbox = document.getElementById(`${type}-notifications`);
            if (checkbox) {
                checkbox.checked = this.settings.notifications[type + 's'];
                checkbox.addEventListener('change', () => {
                    this.settings.notifications[type + 's'] = checkbox.checked;
                });
            }
        });

        // Quiet Hours
        const quietStart = document.getElementById('quiet-start');
        const quietEnd = document.getElementById('quiet-end');
        if (quietStart && quietEnd) {
            quietStart.value = this.settings.notifications.quietHours.start;
            quietEnd.value = this.settings.notifications.quietHours.end;
            quietStart.addEventListener('change', () => {
                this.settings.notifications.quietHours.start = quietStart.value;
            });
            quietEnd.addEventListener('change', () => {
                this.settings.notifications.quietHours.end = quietEnd.value;
            });
        }

        // Privacy Controls
        ['profileVisibility', 'journalPrivacy', 'activityVisibility'].forEach(setting => {
            const select = document.getElementById(setting);
            if (select) {
                select.value = this.settings.privacy[setting];
                select.addEventListener('change', () => {
                    this.settings.privacy[setting] = select.value;
                });
            }
        });

        // Productivity Settings
        const defaultView = document.getElementById('defaultTaskView');
        if (defaultView) {
            defaultView.value = this.settings.productivity.defaultView;
            defaultView.addEventListener('change', () => {
                this.settings.productivity.defaultView = defaultView.value;
            });
        }

        // Focus Mode Settings
        const pomodoro = document.getElementById('pomodoroDuration');
        const breakDuration = document.getElementById('breakDuration');
        if (pomodoro && breakDuration) {
            pomodoro.value = this.settings.productivity.pomodoro.workDuration;
            breakDuration.value = this.settings.productivity.pomodoro.breakDuration;
            pomodoro.addEventListener('change', () => {
                this.settings.productivity.pomodoro.workDuration = parseInt(pomodoro.value);
            });
            breakDuration.addEventListener('change', () => {
                this.settings.productivity.pomodoro.breakDuration = parseInt(breakDuration.value);
            });
        }

        // Accessibility Settings
        ['high-contrast', 'reduce-motion', 'screenReaderMode'].forEach(setting => {
            const checkbox = document.getElementById(setting);
            if (checkbox) {
                checkbox.checked = this.settings.accessibility[this.camelCase(setting)];
                checkbox.addEventListener('change', () => {
                    this.settings.accessibility[this.camelCase(setting)] = checkbox.checked;
                    this.applyAccessibilitySettings();
                });
            }
        });

        // Font Size Control
        const fontSizeSlider = document.getElementById('font-size');
        const fontSizeValue = document.getElementById('fontSizeValue');
        if (fontSizeSlider && fontSizeValue) {
            fontSizeSlider.value = this.settings.accessibility.fontSize;
            fontSizeValue.textContent = `${this.settings.accessibility.fontSize}px`;
            fontSizeSlider.addEventListener('input', () => {
                const size = parseInt(fontSizeSlider.value);
                this.settings.accessibility.fontSize = size;
                fontSizeValue.textContent = `${size}px`;
                document.documentElement.style.fontSize = `${size}px`;
            });
        }

        // AI Features
        ['suggestions', 'wellness', 'focus'].forEach(feature => {
            const checkbox = document.getElementById(`ai-${feature}`);
            if (checkbox) {
                checkbox.checked = this.settings.ai[feature];
                checkbox.addEventListener('change', () => {
                    this.settings.ai[feature] = checkbox.checked;
                });
            }
        });

        // Experimental Features
        ['voice-control', 'mood-analysis'].forEach(feature => {
            const checkbox = document.getElementById(feature);
            if (checkbox) {
                checkbox.checked = this.settings.experimental[this.camelCase(feature)];
                checkbox.addEventListener('change', () => {
                    this.settings.experimental[this.camelCase(feature)] = checkbox.checked;
                });
            }
        });

        // Save & Logout
        document.getElementById('saveAllSettings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        // Profile Settings
        this.setupProfileSettings();
        
        // Data Management
        this.setupDataManagement();
    }

    initializeUI() {
        // Apply current settings to UI
        this.applyTheme();
        this.applyLayout();
        this.applyAccessibilitySettings();
        this.loadUserProfile();
    }

    handleThemeChange(theme) {
        this.settings.theme = theme;
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
        
        const customPanel = document.querySelector('.custom-theme-panel');
        if (customPanel) {
            customPanel.style.display = theme === 'custom' ? 'block' : 'none';
        }

        this.applyTheme();
    }

    applyTheme() {
        const root = document.documentElement;
        if (this.settings.theme === 'custom') {
            this.applyCustomTheme();
        } else {
            root.setAttribute('data-theme', this.settings.theme);
        }
    }

    applyCustomTheme() {
        const root = document.documentElement;
        Object.entries(this.settings.customTheme).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    }

    applyLayout() {
        document.body.className = `settings-page layout-${this.settings.layout}`;
    }

    applyAccessibilitySettings() {
        const { highContrast, reduceMotion, fontSize } = this.settings.accessibility;
        document.documentElement.classList.toggle('high-contrast', highContrast);
        document.documentElement.classList.toggle('reduce-motion', reduceMotion);
        document.documentElement.style.fontSize = `${fontSize}px`;
    }

    setupProfileSettings() {
        const changeAvatarBtn = document.getElementById('changeAvatar');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const avatar = document.getElementById('userAvatar');
                            if (avatar) {
                                avatar.src = e.target.result;
                                this.saveUserProfile({ avatar: e.target.result });
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            });
        }

        ['displayName', 'userBio', 'location', 'timezone'].forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.addEventListener('change', () => {
                    this.saveUserProfile({ [field]: input.value });
                });
            }
        });
    }

    setupDataManagement() {
        document.getElementById('export-data')?.addEventListener('click', () => this.exportData());
        document.getElementById('backup-settings')?.addEventListener('click', () => this.backupSettings());
        document.getElementById('clear-data')?.addEventListener('click', () => this.clearData());
    }

    async exportData() {
        const data = {
            settings: this.settings,
            tasks: JSON.parse(localStorage.getItem('tasks') || '[]'),
            moods: JSON.parse(localStorage.getItem('moods') || '[]'),
            sleep: JSON.parse(localStorage.getItem('sleepLogs') || '[]'),
            user: JSON.parse(localStorage.getItem('flosparc_user') || '{}')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flosparc-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    backupSettings() {
        const backup = {
            timestamp: new Date().toISOString(),
            settings: this.settings
        };
        localStorage.setItem('flosparc_settings_backup', JSON.stringify(backup));
        this.showNotification('Settings backed up successfully');
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.clear();
            window.location.reload();
        }
    }

    saveUserProfile(updates) {
        const user = JSON.parse(localStorage.getItem('flosparc_user') || '{}');
        Object.assign(user, updates);
        localStorage.setItem('flosparc_user', JSON.stringify(user));
        this.showNotification('Profile updated successfully');
    }

    loadUserProfile() {
        const user = JSON.parse(localStorage.getItem('flosparc_user') || '{}');
        const avatar = document.getElementById('userAvatar');
        if (avatar && user.avatar) {
            avatar.src = user.avatar;
        }

        ['displayName', 'userBio', 'location', 'timezone'].forEach(field => {
            const input = document.getElementById(field);
            if (input && user[field]) {
                input.value = user[field];
            }
        });
    }

    async handleLogout() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('flosparc_user');
            window.location.href = '../index.html';
        }
    }

    showSaveConfirmation() {
        this.showNotification('Settings saved successfully');
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => document.body.removeChild(notification), 300);
            }, 2000);
        }, 100);
    }

    camelCase(str) {
        return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
    }
}

// Initialize Settings
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});