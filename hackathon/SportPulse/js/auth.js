function createTransitionElement() {
    const transition = document.createElement('div');
    transition.className = 'page-transition';
    document.body.appendChild(transition);
    return transition;
}

function logout() {
    return new Promise((resolve) => {
        // Create and show transition
        const transition = createTransitionElement();
        requestAnimationFrame(() => transition.classList.add('active'));
        
        // Clear all stored data
        localStorage.clear();
        sessionStorage.clear();
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = '../index.html';
            resolve();
        }, 800);
    });
}

export { logout };
