// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            const isLight = document.body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
    }

    // Initialize particles
    initParticles();

    // Initialize the dashboard
    initDashboard();
});

function initParticles() {
    tsParticles.load("particles", {
        fullScreen: {
            enable: true,
            zIndex: -1
        },
        particles: {
            number: {
                value: 20,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#4C6FFF"
            },
            shape: {
                type: "circle"
            },
            opacity: {
                value: 0.1,
                random: true
            },
            size: {
                value: 5,
                random: true
            },
            move: {
                enable: true,
                speed: 0.5,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
            line_linked: {
                enable: true,
                distance: 200,
                color: "#4C6FFF",
                opacity: 0.2,
                width: 1
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 200,
                    line_linked: {
                        opacity: 0.4
                    }
                }
            }
        },
        retina_detect: true
    });
}

function initDashboard() {
    // Add card entrance animations
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Add hover effects to cards
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.transform = 'scale(1.02) translateY(-10px)';
            card.style.setProperty('--x', x + 'px');
            card.style.setProperty('--y', y + 'px');
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1) translateY(0)';
        });
    });

    // Initialize sport switching
    const sportButtons = document.querySelectorAll('.sport-btn');
    sportButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sport = e.currentTarget.dataset.sport;
            switchSport(sport);
        });
    });
}

// Update chart styles based on theme
function updateChartStyles(chart) {
    const isDark = !document.body.classList.contains('light-theme');
    const textColor = isDark ? '#718096' : '#4B5563';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    chart.options.scales.y.grid.color = gridColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.x.ticks.color = textColor;
    chart.update();
}

// Sport switching animation
function switchSport(sport) {
    const dashboard = document.getElementById('dashboard');
    dashboard.style.opacity = '0';
    dashboard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        updateDashboardData(sport);
        dashboard.style.opacity = '1';
        dashboard.style.transform = 'translateY(0)';
    }, 300);
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export to existing data handling code
window.SPORTS_DATA = window.SPORTS_DATA || {};