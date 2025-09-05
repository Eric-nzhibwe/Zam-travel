// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.section');
const searchInput = document.querySelector('.search-bar input');
const notificationBtn = document.querySelector('.notification-btn');
const settingsBtn = document.querySelector('.settings-btn');

// Initialize Charts
function initializeCharts() {
    // Booking Trends Chart
    const bookingCtx = document.getElementById('bookingChart').getContext('2d');
    new Chart(bookingCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Bookings',
                data: [65, 59, 80, 81, 56, 55],
                borderColor: '#4CAF50',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Revenue Analysis Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                backgroundColor: '#2196F3'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Customer Demographics Chart
    const demographicsCtx = document.getElementById('demographicsChart').getContext('2d');
    new Chart(demographicsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Local', 'International', 'Business', 'Leisure'],
            datasets: [{
                data: [30, 25, 20, 25],
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });

    // Tour Popularity Chart
    const popularityCtx = document.getElementById('tourPopularityChart').getContext('2d');
    new Chart(popularityCtx, {
        type: 'pie',
        data: {
            labels: ['Victoria Falls', 'South Luangwa', 'Lower Zambezi', 'Kafue', 'Livingstone'],
            datasets: [{
                data: [35, 25, 20, 15, 5],
                backgroundColor: ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#F44336']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all links and sections
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));

        // Add active class to clicked link and corresponding section
        link.classList.add('active');
        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
    });
});

// Search Functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const activeSection = document.querySelector('.section.active');
    
    if (activeSection.id === 'customers') {
        filterCustomers(searchTerm);
    } else if (activeSection.id === 'bookings') {
        filterBookings(searchTerm);
    } else if (activeSection.id === 'tours') {
        filterTours(searchTerm);
    } else if (activeSection.id === 'suppliers') {
        filterSuppliers(searchTerm);
    }
});

// Filter Functions
function filterCustomers(searchTerm) {
    const rows = document.querySelectorAll('#customersTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterBookings(searchTerm) {
    const rows = document.querySelectorAll('#bookingsTable tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterTours(searchTerm) {
    const cards = document.querySelectorAll('.tour-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function filterSuppliers(searchTerm) {
    const cards = document.querySelectorAll('.supplier-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Modal Functions
function showAddCustomerModal() {
    const modal = document.getElementById('addCustomerModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Customer</h2>
            <form id="addCustomerForm">
                <div class="form-group">
                    <label for="customerName">Full Name</label>
                    <input type="text" id="customerName" required>
                </div>
                <div class="form-group">
                    <label for="customerEmail">Email</label>
                    <input type="email" id="customerEmail" required>
                </div>
                <div class="form-group">
                    <label for="customerPhone">Phone</label>
                    <input type="tel" id="customerPhone" required>
                </div>
                <div class="form-group">
                    <label for="customerAddress">Address</label>
                    <textarea id="customerAddress" required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal('addCustomerModal')">Cancel</button>
                    <button type="submit">Add Customer</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function showAddBookingModal() {
    const modal = document.getElementById('addBookingModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>New Booking</h2>
            <form id="addBookingForm">
                <div class="form-group">
                    <label for="bookingCustomer">Customer</label>
                    <select id="bookingCustomer" required>
                        <option value="">Select Customer</option>
                        <!-- Customer options will be populated dynamically -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="bookingTour">Tour</label>
                    <select id="bookingTour" required>
                        <option value="">Select Tour</option>
                        <!-- Tour options will be populated dynamically -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="bookingDate">Date</label>
                    <input type="date" id="bookingDate" required>
                </div>
                <div class="form-group">
                    <label for="bookingGuests">Number of Guests</label>
                    <input type="number" id="bookingGuests" min="1" required>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal('addBookingModal')">Cancel</button>
                    <button type="submit">Create Booking</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function showAddTourModal() {
    const modal = document.getElementById('addTourModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Tour</h2>
            <form id="addTourForm">
                <div class="form-group">
                    <label for="tourName">Tour Name</label>
                    <input type="text" id="tourName" required>
                </div>
                <div class="form-group">
                    <label for="tourDescription">Description</label>
                    <textarea id="tourDescription" required></textarea>
                </div>
                <div class="form-group">
                    <label for="tourPrice">Price</label>
                    <input type="number" id="tourPrice" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="tourDuration">Duration (days)</label>
                    <input type="number" id="tourDuration" min="1" required>
                </div>
                <div class="form-group">
                    <label for="tourImage">Image URL</label>
                    <input type="url" id="tourImage" required>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal('addTourModal')">Cancel</button>
                    <button type="submit">Add Tour</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function showAddSupplierModal() {
    const modal = document.getElementById('addSupplierModal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Add New Supplier</h2>
            <form id="addSupplierForm">
                <div class="form-group">
                    <label for="supplierName">Company Name</label>
                    <input type="text" id="supplierName" required>
                </div>
                <div class="form-group">
                    <label for="supplierType">Type</label>
                    <select id="supplierType" required>
                        <option value="hotel">Hotel</option>
                        <option value="transport">Transport</option>
                        <option value="activity">Activity</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="supplierContact">Contact Person</label>
                    <input type="text" id="supplierContact" required>
                </div>
                <div class="form-group">
                    <label for="supplierEmail">Email</label>
                    <input type="email" id="supplierEmail" required>
                </div>
                <div class="form-group">
                    <label for="supplierPhone">Phone</label>
                    <input type="tel" id="supplierPhone" required>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal('addSupplierModal')">Cancel</button>
                    <button type="submit">Add Supplier</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Report Generation
function generateReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!startDate || !endDate) {
        showNotification('Please select both start and end dates', 'error');
        return;
    }

    // Here you would typically make an API call to generate the report
    showNotification('Report generated successfully', 'success');
}

function exportToPDF() {
    // Here you would implement PDF export functionality
    showNotification('Exporting to PDF...', 'success');
}

function exportToExcel() {
    // Here you would implement Excel export functionality
    showNotification('Exporting to Excel...', 'success');
}

// Notification System
function showNotification(message, type = 'success') {
    let notif = document.createElement('div');
    notif.className = 'notification ' + type;
    notif.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 500);
    }, 3000);
}

// Modern homepage interactivity for Zambia Travel Agency

document.addEventListener('DOMContentLoaded', function () {
    // 1. Live search for featured destinations and tours
    const searchForm = document.getElementById('search');
    if (searchForm) {
        searchForm.addEventListener('input', function (e) {
            const q = searchForm.querySelector('input[name="q"]').value.toLowerCase();
            // Filter destinations
            document.querySelectorAll('.destination-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(q) ? '' : 'none';
            });
            // Filter tours (if you add .tour-card in the future)
            document.querySelectorAll('.tour-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(q) ? '' : 'none';
            });
        });
    }

    // 2. Booking form success message
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();
            bookingForm.reset();
            showNotification('Your booking has been received! We will contact you soon.', 'success');
        });
    }

    // 3. Contact form success message
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            contactForm.reset();
            showNotification('Thank you for contacting us! We will reply soon.', 'success');
        });
    }

    // 4. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
    
    // Close modals when clicking outside
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}); 