// admin-dashboard.js
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

function loadBookings() {
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const bookingsTable = document.getElementById('bookingsTable').getElementsByTagName('tbody')[0];
    bookingsTable.innerHTML = '';
    bookings.forEach(booking => {
        const row = bookingsTable.insertRow();
        row.insertCell(0).textContent = booking.tour || booking.tourName || '';
        row.insertCell(1).textContent = booking.customerName || booking.name || '';
        row.insertCell(2).textContent = booking.email || '';
        row.insertCell(3).textContent = booking.date || '';
        row.insertCell(4).textContent = booking.people || '';
        row.insertCell(5).textContent = booking.amount || '';
        row.insertCell(6).textContent = booking.payment || '';
        row.insertCell(7).textContent = booking.bookingId || booking.bookingID || '';
    });
}

function renderDashboardUserFeatures(searchTerm = '') {
    const featuresDiv = document.getElementById('dashboardUserFeatures');
    if (!featuresDiv) return;
    featuresDiv.innerHTML = `
        <h4>Manage Registered Users</h4>
        <input type="text" id="dashboardUserSearch" placeholder="Search by name, email, or contact..." style="margin-bottom:10px;width:80%;padding:6px;">
        <button id="dashboardExportCSV" style="margin-bottom:10px;">Export as CSV</button>
        <ul id="dashboardUserListUl"></ul>
    `;
    renderDashboardUserList(searchTerm);
    document.getElementById('dashboardUserSearch').addEventListener('input', function(e) {
        renderDashboardUserList(e.target.value);
    });
    document.getElementById('dashboardExportCSV').addEventListener('click', function() {
        exportDashboardUsersAsCSV();
    });
}

function renderDashboardUserList(searchTerm = '') {
    let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
    const ul = document.getElementById('dashboardUserListUl');
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
        li.innerHTML = `<strong>Name:</strong> ${user.name || ''} | <strong>Email:</strong> ${user.email || ''} | <strong>Contact:</strong> ${user.contactNumber || ''} <button data-idx="${idx}" class="dashboardDeleteUserBtn" style="margin-left:10px;">Delete</button>`;
        ul.appendChild(li);
    });
    // Attach delete handlers
    document.querySelectorAll('.dashboardDeleteUserBtn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-idx'));
            deleteDashboardUser(idx);
        });
    });
}

function deleteDashboardUser(idx) {
    let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
    userLogins.splice(idx, 1);
    localStorage.setItem('userLogins', JSON.stringify(userLogins));
    renderDashboardUserList(document.getElementById('dashboardUserSearch').value);
}

function exportDashboardUsersAsCSV() {
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

document.addEventListener('DOMContentLoaded', function() {
    loadUsers();
    loadBookings();
    renderDashboardUserFeatures();
    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = 'admin.html';
    });
});

window.addEventListener('storage', function(event) {
    if (event.key === 'userLogins') {
        if (document.getElementById('dashboardUserSearch')) {
            renderDashboardUserList(document.getElementById('dashboardUserSearch').value);
        } else {
            renderDashboardUserList();
        }
    }
}); 