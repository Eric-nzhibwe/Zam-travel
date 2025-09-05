// admin.js
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_CONTACT = '0771493387';

// Show/hide dashboard based on login
function showDashboard() {
    document.getElementById('adminLoginContainer').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadUsers();
    loadBookings();
}

function showLogin() {
    document.getElementById('adminLoginContainer').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const contact = document.getElementById('adminContact').value.trim();
    const errorDiv = document.getElementById('adminLoginError');
    if (!username || !password || !contact) {
        errorDiv.textContent = 'All fields are required.';
        errorDiv.style.display = 'block';
        return;
    }
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        errorDiv.style.display = 'none';
        window.location.href = 'admin-dashboard.html';
    } else {
        errorDiv.textContent = 'Invalid admin credentials.';
        errorDiv.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Icon toggle for password visibility (admin login)
    document.querySelectorAll('.input-group input[type="password"]').forEach(function(input) {
        const icon = input.parentElement.querySelector('i.fas.fa-eye');
        if (icon) {
            icon.style.cursor = 'pointer';
            icon.addEventListener('click', function() {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        }
    });
    // Focus/blur effect for icons
    document.querySelectorAll('.input-group input').forEach(function(input) {
        const icon = input.parentElement.querySelector('i.fas');
        if (icon) {
            input.addEventListener('focus', function() {
                icon.style.color = '#2575fc';
            });
            input.addEventListener('blur', function() {
                icon.style.color = '';
            });
        }
    });
    // --- Admin Features: Search, Delete, Export ---
    const userListDiv = document.getElementById('adminUserList');
    if (userListDiv) {
        // Add search and export UI
        userListDiv.innerHTML = `
            <h3>All Registered Users</h3>
            <input type="text" id="userSearch" placeholder="Search by name, email, or contact..." style="margin-bottom:10px;width:80%;padding:6px;">
            <button id="exportCSV" style="margin-bottom:10px;">Export as CSV</button>
            <ul id="userListUl"></ul>
        `;
        renderUserList();
        // Search functionality
        document.getElementById('userSearch').addEventListener('input', function(e) {
            renderUserList(e.target.value);
        });
        // Export functionality
        document.getElementById('exportCSV').addEventListener('click', function() {
            exportUsersAsCSV();
        });
    }

    function renderUserList(searchTerm = '') {
        let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
        const ul = document.getElementById('userListUl');
        ul.innerHTML = '';
        // Filter by search term
        if (searchTerm) {
            userLogins = userLogins.filter(user =>
                (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (user.contactNumber && user.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        if (userLogins.length === 0) {
            ul.innerHTML = '<li>No registered users found.</li>';
            return;
        }
        userLogins.forEach((user, idx) => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Name:</strong> ${user.name || ''} | <strong>Email:</strong> ${user.email || ''} | <strong>Contact:</strong> ${user.contactNumber || ''} <button data-idx="${idx}" class="deleteUserBtn" style="margin-left:10px;">Delete</button>`;
            ul.appendChild(li);
        });
        // Attach delete handlers
        document.querySelectorAll('.deleteUserBtn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                deleteUser(idx);
            });
        });
    }

    function deleteUser(idx) {
        let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
        userLogins.splice(idx, 1);
        localStorage.setItem('userLogins', JSON.stringify(userLogins));
        renderUserList(document.getElementById('userSearch').value);
    }

    function exportUsersAsCSV() {
        const userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
        if (userLogins.length === 0) {
            alert('No users to export.');
            return;
        }
        const header = ['Name', 'Email', 'Contact Number'];
        const rows = userLogins.map(u => [u.name, u.email, u.contactNumber]);
        let csvContent = header.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.map(field => '"' + (field || '') + '"').join(',') + '\n';
        });
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'registered_users.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

// Populate Registered Users Table
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
    usersTable.innerHTML = '';
    users.forEach(user => {
        const row = usersTable.insertRow();
        row.insertCell(0).textContent = user.name;
        row.insertCell(1).textContent = user.email;
    });
}

// Populate Booked Tours Table
function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingsTable = document.getElementById('bookingsTable').getElementsByTagName('tbody')[0];
    bookingsTable.innerHTML = '';
    bookings.forEach(booking => {
        const row = bookingsTable.insertRow();
        row.insertCell(0).textContent = booking.tourName;
        row.insertCell(1).textContent = booking.customerName;
        row.insertCell(2).textContent = booking.email;
        row.insertCell(3).textContent = booking.date;
    });
}

window.addEventListener('storage', function(event) {
    if (event.key === 'userLogins') {
        if (document.getElementById('userSearch')) {
            renderUserList(document.getElementById('userSearch').value);
        } else {
            renderUserList();
        }
    }
}); 