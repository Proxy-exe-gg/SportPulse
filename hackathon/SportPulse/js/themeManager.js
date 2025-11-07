const themeManager = {
    themes: {
        ocean: {
            name: 'Ocean Theme',
            description: 'Calm and focused environment with ocean-inspired colors',
            bg: 'linear-gradient(to bottom right, #1a2b4d, #162036)',
            cardBg: 'rgba(255, 255, 255, 0.05)',
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.7)',
            primary: '#4a90e2',
            secondary: '#34495e',
            accent: '#3498db',
            success: '#2ecc71',
            error: '#e74c3c'
        },
        sunset: {
            name: 'Sunset Theme',
            description: 'Warm and energizing palette inspired by dusk',
            bg: 'linear-gradient(to bottom right, #2c1445, #431857)',
            cardBg: 'rgba(255, 255, 255, 0.05)',
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.7)',
            primary: '#e67e22',
            secondary: '#d35400',
            accent: '#f39c12',
            success: '#27ae60',
            error: '#c0392b'
        },
        forest: {
            name: 'Forest Theme',
            description: 'Natural and peaceful environment with forest tones',
            bg: 'linear-gradient(to bottom right, #1b4d3e, #163628)',
            cardBg: 'rgba(255, 255, 255, 0.05)',
            text: '#ffffff',
            textMuted: 'rgba(255, 255, 255, 0.7)',
            primary: '#27ae60',
            secondary: '#2ecc71',
            accent: '#16a085',
            success: '#2ecc71',
            error: '#e74c3c'
        }
    },

    getCurrentTheme() {
        return localStorage.getItem('theme') || 'ocean';
    },

    getAllThemes() {
        return Object.entries(this.themes).map(([id, theme]) => ({
            id,
            ...theme
        }));
    },

    applyTheme(themeId) {
        const theme = this.themes[themeId];
        if (!theme) return;

        const root = document.documentElement;
        root.style.setProperty('--bg', theme.bg);
        root.style.setProperty('--card-bg', theme.cardBg);
        root.style.setProperty('--text', theme.text);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--primary', theme.primary);
        root.style.setProperty('--secondary', theme.secondary);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--success', theme.success);
        root.style.setProperty('--error', theme.error);

        localStorage.setItem('theme', themeId);
        
        // Trigger custom event for theme change
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: themeId } }));
    },

    init() {
        // Apply theme on page load
        const savedTheme = this.getCurrentTheme();
        this.applyTheme(savedTheme);

        // Apply theme when storage changes (for cross-tab sync)
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme') {
                this.applyTheme(e.newValue);
            }
        });
    }
};

export default themeManager;