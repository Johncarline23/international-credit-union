let pendingAction = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
    
    // Modal Confirm Button Listener
    const confirmBtn = document.getElementById('confirm-action-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            if (pendingAction) pendingAction();
        });
    }
});

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');

    const titles = { 'users': 'User Management', 'messages': 'Contact Messages' };
    document.getElementById('page-title').textContent = titles[tabId];

    if (tabId === 'users') fetchUsers();
    if (tabId === 'messages') fetchMessages();
}

async function fetchUsers() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        if (data.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No users found</td></tr>';
            return;
        }

        data.users.forEach(user => {
            let statusLabel = user.status.charAt(0).toUpperCase() + user.status.slice(1);
            let statusClass = `status-${user.status}`;
            let actionBtns = '';

            if (user.status === 'active') {
                actionBtns = `
                    <button class="action-btn btn-block" onclick="toggleStatus(${user.id}, 'blocked')">Block</button>
                    <button class="action-btn btn-suspend" onclick="toggleStatus(${user.id}, 'suspended')">Suspend</button>
                `;
            } else if (user.status === 'blocked') {
                actionBtns = `
                    <button class="action-btn btn-activate" onclick="toggleStatus(${user.id}, 'active')">Unblock</button>
                    <button class="action-btn btn-suspend" onclick="toggleStatus(${user.id}, 'suspended')">Suspend</button>
                `;
            } else if (user.status === 'suspended') {
                actionBtns = `
                    <button class="action-btn btn-activate" onclick="toggleStatus(${user.id}, 'active')">Reactivate</button>
                `;
            }

            const row = `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.full_name || user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td style="display:flex; gap:5px;">${actionBtns}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (err) {
        showToast('Failed to load users', 'error');
    }
}

function toggleStatus(userId, newStatus) {
    const modal = document.getElementById('confirm-modal');
    const msg = document.getElementById('confirm-message');
    const btn = document.getElementById('confirm-action-btn');
    
    const actionText = newStatus === 'active' ? 'activate' : (newStatus === 'blocked' ? 'block' : 'suspend');
    msg.textContent = `Are you sure you want to ${actionText} this user?`;
    
    // Style button based on action
    if (newStatus === 'suspended') {
        btn.style.background = 'var(--secondary)'; // Red
        btn.textContent = 'Suspend';
    } else if (newStatus === 'blocked') {
        btn.style.background = '#d97706'; // Orange
        btn.textContent = 'Block';
    } else { 
        btn.style.background = '#27ae60'; // Green
        btn.textContent = 'Activate';
    }

    pendingAction = async () => {
        try {
            const res = await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                showToast(`User status updated to ${newStatus}`, 'success');
                fetchUsers();
            } else if (res.status === 403) {
                showToast('Session expired or unauthorized. Please login again.', 'error');
                setTimeout(() => window.location.href = '/admin-login', 2000);
            } else {
                showToast('Action failed', 'error');
            }
        } catch (err) {
            showToast('Error updating status', 'error');
        }
        closeConfirmModal();
    };
    
    modal.classList.add('active');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('active');
    pendingAction = null;
}

async function fetchMessages() {
    try {
        const res = await fetch('/api/admin/messages');
        const data = await res.json();
        const list = document.getElementById('messages-list');
        list.innerHTML = '';

        if (data.messages.length === 0) {
            list.innerHTML = '<div style="padding:20px; text-align:center">No messages</div>';
            return;
        }

        data.messages.forEach(msg => {
            const item = `
                <div class="message-item">
                    <div class="message-header">
                        <span class="msg-sender">${msg.name} (${msg.email})</span>
                        <span class="msg-date">${new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <span class="msg-subject">${msg.subject || 'No Subject'}</span>
                    <p class="msg-body">${msg.message}</p>
                </div>
            `;
            list.insertAdjacentHTML('beforeend', item);
        });
    } catch (err) {
        showToast('Failed to load messages', 'error');
    }
}

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}