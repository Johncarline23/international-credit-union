// Toast Notification Function
function showToast(message, type = 'info') {
    // Check for inline login message box first
    const loginBox = document.getElementById('login-message-box');
    if (loginBox) {
        const msgType = type === 'error' ? 'error' : 'success';
        loginBox.innerHTML = `<div class="login-message ${msgType}">${message}</div>`;
        
        // Clear after 3.5s
        setTimeout(() => {
            loginBox.innerHTML = '';
        }, 3500);
        return;
    }

    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');

    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const username = usernameInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Server Error:', response.status, text);
                    throw new Error(`Server responded with ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    showToast(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast(error.message || 'An error occurred. Please try again.', 'error');
            }
        });
    }
});