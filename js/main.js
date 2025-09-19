// Authentication Check
function checkAuth() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = 'auth.html';
        return;
    }
    return JSON.parse(userData);
}

// Data Management
let customers = [];
let bookings = [];
let tours = [];
let suppliers = [];

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const content = document.querySelector('.content');

// Navigation Handler
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        // Add active class to clicked link
        link.classList.add('active');
        
        // Load corresponding page content
        const page = link.getAttribute('data-page');
        loadPage(page);
    });
});

// Page Loader
function loadPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const selectedPage = document.getElementById(page);
    if (selectedPage) {
        selectedPage.classList.add('active');
    } else {
        // Create and load page content if it doesn't exist
        createPageContent(page);
    }

    // Update dashboard stats when dashboard is loaded
    if (page === 'dashboard') {
        updateDashboardStats();
    }
}

// Dashboard Stats Update
function updateDashboardStats() {
    document.getElementById('totalCustomers').textContent = customers.length;
    document.getElementById('activeBookings').textContent = bookings.filter(b => b.status === 'confirmed').length;
    document.getElementById('availableTours').textContent = tours.length;
    document.getElementById('totalSuppliers').textContent = suppliers.length;
}

// Page Content Creator
function createPageContent(page) {
    const pageContent = document.createElement('section');
    pageContent.id = page;
    pageContent.className = 'page active';
    
    let content = '';
    
    switch(page) {
        case 'dashboard':
            content = createDashboardPage();
            break;
        case 'customers':
            content = createCustomersPage();
            break;
        case 'bookings':
            content = createBookingsPage();
            break;
        case 'tours':
            content = createToursPage();
            break;
        case 'suppliers':
            content = createSuppliersPage();
            break;
        case 'reports':
            content = createReportsPage();
            break;
        case 'settings':
            content = createSettingsPage();
            break;
    }
    
    pageContent.innerHTML = content;
    document.querySelector('.content').appendChild(pageContent);

    // Initialize any necessary event listeners for the new page
    initializePageEventListeners(page);
}

// Dashboard Page
function createDashboardPage() {
    return `
        <h2>Dashboard</h2>
        <div class="dashboard-stats">
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <div class="stat-info">
                    <h3>Total Customers</h3>
                    <p id="totalCustomers">0</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-calendar-check"></i>
                <div class="stat-info">
                    <h3>Active Bookings</h3>
                    <p id="activeBookings">0</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-map-marked-alt"></i>
                <div class="stat-info">
                    <h3>Available Tours</h3>
                    <p id="availableTours">0</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-handshake"></i>
                <div class="stat-info">
                    <h3>Suppliers</h3>
                    <p id="totalSuppliers">0</p>
                </div>
            </div>
        </div>
        <div class="dashboard-charts">
            <div class="chart-container">
                <h3>Booking Trends</h3>
                <canvas id="bookingTrendsChart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Revenue Overview</h3>
                <canvas id="revenueChart"></canvas>
            </div>
        </div>
        <div class="recent-activities">
            <h3>Recent Activities</h3>
            <div class="activity-list" id="activityList">
                <!-- Activities will be populated here -->
            </div>
        </div>
    `;
}

// Page Templates
function createCustomersPage() {
    return `
        <h2>Customer Management</h2>
        <div class="action-bar">
            <button class="btn-primary" onclick="showAddCustomerModal()">
                <i class="fas fa-plus"></i> Add Customer
            </button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="customersTableBody">
                    <!-- Customer data will be populated here -->
                </tbody>
            </table>
        </div>
    `;
}

function createBookingsPage() {
    return `
        <h2>Booking Management</h2>
        <div class="action-bar">
            <button class="btn-primary" onclick="showAddBookingModal()">
                <i class="fas fa-plus"></i> New Booking
            </button>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>Customer</th>
                        <th>Tour</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="bookingsTableBody">
                    <!-- Booking data will be populated here -->
                </tbody>
            </table>
        </div>
    `;
}

// Tours Page
function createToursPage() {
    return `
        <h2>Tour Management</h2>
        <div class="action-bar">
            <button class="btn-primary" onclick="showAddTourModal()">
                <i class="fas fa-plus"></i> Add Tour
            </button>
            <div class="filter-group">
                <select id="tourFilter" onchange="filterTours()">
                    <option value="all">All Tours</option>
                    <option value="active">Active</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
        </div>
        <div class="tours-grid" id="toursGrid">
            <!-- Tour cards will be populated here -->
        </div>
    `;
}

// Suppliers Page
function createSuppliersPage() {
    return `
        <h2>Supplier Management</h2>
        <div class="action-bar">
            <button class="btn-primary" onclick="showAddSupplierModal()">
                <i class="fas fa-plus"></i> Add Supplier
            </button>
            <div class="filter-group">
                <select id="supplierFilter" onchange="filterSuppliers()">
                    <option value="all">All Suppliers</option>
                    <option value="hotel">Hotels</option>
                    <option value="transport">Transport</option>
                    <option value="activity">Activities</option>
                </select>
            </div>
        </div>
        <div class="suppliers-grid" id="suppliersGrid">
            <!-- Supplier cards will be populated here -->
        </div>
    `;
}

// Reports Page
function createReportsPage() {
    return `
        <h2>Reports & Analytics</h2>
        <div class="reports-filters">
            <div class="date-range">
                <label>Date Range:</label>
                <input type="date" id="startDate">
                <input type="date" id="endDate">
                <button class="btn-secondary" onclick="generateReports()">Generate</button>
            </div>
            <div class="report-type">
                <select id="reportType" onchange="updateReportType()">
                    <option value="bookings">Booking Reports</option>
                    <option value="revenue">Revenue Reports</option>
                    <option value="customers">Customer Reports</option>
                    <option value="tours">Tour Reports</option>
                </select>
            </div>
        </div>
        <div class="reports-grid">
            <div class="report-card">
                <h3>Booking Statistics</h3>
                <canvas id="bookingChart"></canvas>
            </div>
            <div class="report-card">
                <h3>Revenue Overview</h3>
                <canvas id="revenueChart"></canvas>
            </div>
            <div class="report-card">
                <h3>Popular Tours</h3>
                <canvas id="toursChart"></canvas>
            </div>
            <div class="report-card">
                <h3>Customer Demographics</h3>
                <canvas id="demographicsChart"></canvas>
            </div>
        </div>
        <div class="export-options">
            <button class="btn-secondary" onclick="exportReport('pdf')">
                <i class="fas fa-file-pdf"></i> Export as PDF
            </button>
            <button class="btn-secondary" onclick="exportReport('excel')">
                <i class="fas fa-file-excel"></i> Export as Excel
            </button>
        </div>
    `;
}

function createSettingsPage() {
    const userData = checkAuth();
    return `
        <h2>Settings</h2>
        <div class="settings-container">
            <div class="settings-section">
                <h3>User Profile</h3>
                <form id="profileForm">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" id="userName" class="form-control" value="${userData.name}">
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="userEmail" class="form-control" value="${userData.email}">
                    </div>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </form>
            </div>
            <div class="settings-section">
                <h3>Security</h3>
                <form id="securityForm">
                    <div class="form-group">
                        <label>Current Password</label>
                        <input type="password" id="currentPassword" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>New Password</label>
                        <input type="password" id="newPassword" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Confirm New Password</label>
                        <input type="password" id="confirmPassword" class="form-control">
                    </div>
                    <button type="submit" class="btn-primary">Update Password</button>
                </form>
            </div>
            <div class="settings-section">
                <button class="btn-danger" onclick="logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>
    `;
}

// Initialize Page Event Listeners
function initializePageEventListeners(page) {
    switch(page) {
        case 'dashboard':
            initializeDashboardCharts();
            updateRecentActivities();
            break;
        case 'tours':
            loadTours();
            break;
        case 'suppliers':
            loadSuppliers();
            break;
        case 'reports':
            initializeReportCharts();
            break;
    }
}

// Dashboard Charts
function initializeDashboardCharts() {
    // Booking Trends Chart
    const bookingCtx = document.getElementById('bookingTrendsChart').getContext('2d');
    new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Bookings',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 3000, 5000, 2000, 3000],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
            }]
        }
    });
}

// Recent Activities
function updateRecentActivities() {
    const activities = [
        { type: 'booking', message: 'New booking created for Victoria Falls Tour', time: '2 hours ago' },
        { type: 'customer', message: 'New customer registered: John Doe', time: '3 hours ago' },
        { type: 'tour', message: 'Tour "Safari Adventure" updated', time: '5 hours ago' },
        { type: 'supplier', message: 'New supplier added: Hotel XYZ', time: '1 day ago' }
    ];

    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item ${activity.type}">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

function getActivityIcon(type) {
    const icons = {
        booking: 'calendar-check',
        customer: 'user',
        tour: 'map-marked-alt',
        supplier: 'handshake'
    };
    return icons[type] || 'circle';
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const userData = checkAuth();
    if (!userData) return;
    
    // Update user profile in header
    const userProfile = document.querySelector('.user-profile span');
    if (userProfile) {
        userProfile.textContent = userData.name;
    }
    
    // Load dashboard by default
    loadPage('dashboard');
    
    // Initialize any necessary event listeners
    initializeEventListeners();
});

// Event Listeners Initialization
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const currentPage = document.querySelector('.page.active').id;
            handleSearch(searchTerm, currentPage);
        });
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userData = checkAuth();
            userData.name = document.getElementById('userName').value;
            userData.email = document.getElementById('userEmail').value;
            localStorage.setItem('userData', JSON.stringify(userData));
            showNotification('Profile updated successfully');
        });
    }
    
    // Security form submission
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            const userData = checkAuth();
            if (atob(userData.password) !== currentPassword) {
                showNotification('Current password is incorrect', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match', 'error');
                return;
            }
            
            if (!validatePassword(newPassword)) {
                showNotification('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number', 'error');
                return;
            }
            
            userData.password = btoa(newPassword);
            localStorage.setItem('userData', JSON.stringify(userData));
            showNotification('Password updated successfully');
            
            // Clear form
            securityForm.reset();
        });
    }
}

// Search Handler
function handleSearch(term, page) {
    switch(page) {
        case 'customers':
            filterCustomers(term);
            break;
        case 'bookings':
            filterBookings(term);
            break;
        case 'tours':
            filterTours(term);
            break;
        case 'suppliers':
            filterSuppliers(term);
            break;
    }
}

// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-ZM', {
        style: 'currency',
        currency: 'ZMW'
    }).format(amount);
}

function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
}

function logout() {
    localStorage.removeItem('userData');
    window.location.href = 'auth.html';
}

// SPA logic for Zambia Travel Agency Customer Portal

document.addEventListener('DOMContentLoaded', function () {
    // Tab navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabSections = document.querySelectorAll('.tab-section');
    const tabLinks = document.querySelectorAll('.tab-link');
    function showTab(tab) {
        tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
        tabSections.forEach(sec => sec.classList.toggle('active', sec.id === 'tab-' + tab));
        tabLinks.forEach(link => link.classList.toggle('active', link.dataset.tab === tab));
    }
    tabBtns.forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
    tabLinks.forEach(link => link.addEventListener('click', e => { e.preventDefault(); showTab(link.dataset.tab); }));

    // --- Customer Profile Management ---
    const profileForm = document.getElementById('profileForm');
    const profileDetails = document.getElementById('profileDetails');
    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('customerProfile') || '{}');
        profileForm.name.value = profile.name || '';
        profileForm.email.value = profile.email || '';
        profileForm.phone.value = profile.phone || '';
        profileDetails.innerHTML = profile.name ? `<strong>${profile.name}</strong><br>${profile.email}<br>${profile.phone}` : '<em>No profile saved yet.</em>';
    }
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const profile = {
            name: profileForm.name.value,
            email: profileForm.email.value,
            phone: profileForm.phone.value
        };
        localStorage.setItem('customerProfile', JSON.stringify(profile));
        loadProfile();
        showNotification('Profile saved!', 'success');
    });
    loadProfile();

    // --- Contact Management ---
    const contactList = document.getElementById('contactList');
    const addContactForm = document.getElementById('addContactForm');
    function renderContacts() {
        const contacts = JSON.parse(localStorage.getItem('customerContacts') || '[]');
        contactList.innerHTML = contacts.length ? '' : '<em>No contacts added.</em>';
        contacts.forEach((c, i) => {
            const div = document.createElement('div');
            div.className = 'contact-item';
            div.innerHTML = `<span>${c}</span><button title="Remove" data-i="${i}"><i class="fas fa-trash"></i></button>`;
            div.querySelector('button').onclick = function() {
                contacts.splice(i, 1);
                localStorage.setItem('customerContacts', JSON.stringify(contacts));
                renderContacts();
            };
            contactList.appendChild(div);
        });
    }
    addContactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const val = addContactForm.contact.value.trim();
        if (!val) return;
        const contacts = JSON.parse(localStorage.getItem('customerContacts') || '[]');
        contacts.push(val);
        localStorage.setItem('customerContacts', JSON.stringify(contacts));
        addContactForm.reset();
        renderContacts();
        showNotification('Contact added!', 'success');
    });
    renderContacts();

    // --- Tour Management ---
    const tourForm = document.getElementById('tourForm');
    const tourList = document.getElementById('tourList');
    function getTours() {
        return JSON.parse(localStorage.getItem('tours') || '[]');
    }
    function saveTours(tours) {
        localStorage.setItem('tours', JSON.stringify(tours));
    }
    function renderTours() {
        const tours = getTours();
        tourList.innerHTML = '';
        tours.forEach((tour, i) => {
            const div = document.createElement('div');
            div.className = 'tour-card';
            div.innerHTML = `<h4>${tour.name}</h4><div class="schedule">${tour.schedule}</div><div class="price">$${tour.price}</div><button class="btn-secondary" data-i="${i}">Remove</button>`;
            div.querySelector('button').onclick = function() {
                tours.splice(i, 1);
                saveTours(tours);
                renderTours();
                renderTourSelect();
            };
            tourList.appendChild(div);
        });
    }
    tourForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const t = {
            name: tourForm.name.value,
            schedule: tourForm.schedule.value,
            price: parseFloat(tourForm.price.value)
        };
        const tours = getTours();
        tours.push(t);
        saveTours(tours);
        tourForm.reset();
        renderTours();
        renderTourSelect();
        showNotification('Tour added!', 'success');
    });

    // --- Booking Engine ---
    const bookingForm = document.getElementById('bookingForm');
    const bookingTourSelect = document.getElementById('bookingTourSelect');
    function renderTourSelect() {
        const tours = getTours();
        bookingTourSelect.innerHTML = tours.length ? '' : '<option value="">No tours available</option>';
        tours.forEach((t, i) => {
            const opt = document.createElement('option');
            opt.value = i;
            opt.textContent = `${t.name} ($${t.price})`;
            bookingTourSelect.appendChild(opt);
        });
    }
    renderTourSelect();

    function getBookings() {
        return JSON.parse(localStorage.getItem('bookings') || '[]');
    }
    function saveBookings(bookings) {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const tours = getTours();
        const tourIdx = bookingForm.tour.value;
        if (!tours[tourIdx]) return;
        const booking = {
            tour: tours[tourIdx].name,
            date: bookingForm.date.value,
            people: bookingForm.people.value,
            price: tours[tourIdx].price,
            total: tours[tourIdx].price * bookingForm.people.value,
            status: 'confirmed',
            payment: bookingForm.payment.value,
            id: 'BK' + Date.now()
        };
        const bookings = getBookings();
        bookings.unshift(booking);
        saveBookings(bookings);
        bookingForm.reset();
        renderBookingHistory();
        showReceipt(booking);
    });

    // --- Booking Tracking/History ---
    const bookingHistoryTable = document.getElementById('bookingHistoryTable').querySelector('tbody');
    function renderBookingHistory() {
        const bookings = getBookings();
        bookingHistoryTable.innerHTML = '';
        bookings.forEach(b => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${b.tour}</td><td>${b.date}</td><td>${b.people}</td><td class="status ${b.status}">${b.status.charAt(0).toUpperCase() + b.status.slice(1)}</td><td><button class="btn-secondary" onclick='showReceipt(${JSON.stringify(b)})'>View</button></td>`;
            bookingHistoryTable.appendChild(tr);
        });
    }
    renderBookingHistory();

    // --- Receipt Modal ---
    window.showReceipt = function(booking) {
        if (typeof booking === 'string') booking = JSON.parse(booking);
        const modal = document.getElementById('receiptModal');
        const content = document.getElementById('receiptContent');
        content.innerHTML = `<h3>Payment Receipt</h3>
            <div style='margin-bottom:10px;'><strong>Booking ID:</strong> ${booking.id}</div>
            <div><strong>Tour:</strong> ${booking.tour}</div>
            <div><strong>Date:</strong> ${booking.date}</div>
            <div><strong>People:</strong> ${booking.people}</div>
            <div><strong>Payment:</strong> ${booking.payment}</div>
            <div><strong>Total Paid:</strong> $${booking.total}</div>
            <button class='close-btn' onclick='closeReceipt()'>Close</button>`;
        modal.style.display = 'flex';
    }
    window.closeReceipt = function() {
        document.getElementById('receiptModal').style.display = 'none';
    }
}); 