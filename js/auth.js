function switchTab(tabId) {
    // Hide all forms
    document.querySelectorAll('.auth-form-view').forEach(form => {
        form.classList.remove('active');
    });
    
    // Remove active class from tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected form
    if (tabId === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
    }
}

function handleAuth(event) {
    event.preventDefault(); // Prevent actual form submission for now
    
    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    
    // Loading state
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AUTHENTICATING...';
    btn.style.opacity = '0.8';
    
    // Simulate network request
    setTimeout(() => {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1000);
}
