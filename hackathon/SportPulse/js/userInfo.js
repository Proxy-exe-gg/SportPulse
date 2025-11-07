export function getUserInfo() {
    return JSON.parse(localStorage.getItem('flosparc_user')) || { 
        name: 'User',
        avatar: null,
        bio: '',
        email: '',
        preferences: {}
    };
}

export function setUserInfo(user) {
    localStorage.setItem('flosparc_user', JSON.stringify(user));
    updateUserDisplay();
    window.dispatchEvent(new Event('userUpdated'));
}

export function updateUserDisplay() {
    const user = getUserInfo();
    
    // Update all user names across pages
    document.querySelectorAll('[data-user-name], #userName, #userNameSidebar').forEach(el => {
        el.textContent = user.name || 'User';
    });

    // Update all avatars across pages
    document.querySelectorAll('#userAvatar, [data-user-avatar]').forEach(el => {
        if (user.avatar) {
            el.innerHTML = `<img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover rounded-full">`;
        } else {
            const initials = (user.name || 'User')[0].toUpperCase();
            el.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] text-xl font-bold">${initials}</div>`;
        }
    });

    // Update user bio if exists
    document.querySelectorAll('[data-user-bio]').forEach(el => {
        el.textContent = user.bio || 'No bio yet...';
    });
}

// Auto-update when DOM is ready
document.addEventListener('DOMContentLoaded', updateUserDisplay);

// Auto-update when user info changes
window.addEventListener('userUpdated', updateUserDisplay);
