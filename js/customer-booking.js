// Customer Management
class Customer {
    constructor(id, name, email, phone, address) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.createdAt = new Date();
    }
}

// Booking Management
class Booking {
    constructor(id, customerId, tourId, bookingDate, numberOfPeople, totalAmount, status) {
        this.id = id;
        this.customerId = customerId;
        this.tourId = tourId;
        this.bookingDate = bookingDate;
        this.numberOfPeople = numberOfPeople;
        this.totalAmount = totalAmount;
        this.status = status; // 'pending', 'confirmed', 'cancelled'
        this.createdAt = new Date();
    }
}

// Data Storage (temporary, will be replaced with database)
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];

// Customer Management Functions
function addCustomer(customerData) {
    const newCustomer = new Customer(
        generateId(),
        customerData.name,
        customerData.email,
        customerData.phone,
        customerData.address
    );
    customers.push(newCustomer);
    saveCustomers();
    return newCustomer;
}

function updateCustomer(id, customerData) {
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
        customers[index] = { ...customers[index], ...customerData };
        saveCustomers();
        return customers[index];
    }
    return null;
}

function deleteCustomer(id) {
    customers = customers.filter(c => c.id !== id);
    saveCustomers();
}

function getCustomer(id) {
    return customers.find(c => c.id === id);
}

function getAllCustomers() {
    return customers;
}

// Booking Management Functions
function addBooking(bookingData) {
    const newBooking = new Booking(
        generateId(),
        bookingData.customerId,
        bookingData.tourId,
        bookingData.bookingDate,
        bookingData.numberOfPeople,
        bookingData.totalAmount,
        'pending'
    );
    bookings.push(newBooking);
    saveBookings();
    return newBooking;
}

function updateBooking(id, bookingData) {
    const index = bookings.findIndex(b => b.id === id);
    if (index !== -1) {
        bookings[index] = { ...bookings[index], ...bookingData };
        saveBookings();
        return bookings[index];
    }
    return null;
}

function deleteBooking(id) {
    bookings = bookings.filter(b => b.id !== id);
    saveBookings();
}

function getBooking(id) {
    return bookings.find(b => b.id === id);
}

function getAllBookings() {
    return bookings;
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

function saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

function saveBookingForAdmin(booking) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// UI Functions
function showAddCustomerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Customer</h3>
                <button class="close-btn">&times;</button>
            </div>
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
                <button type="submit" class="btn-primary">Add Customer</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal functionality
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Form submission
    modal.querySelector('#addCustomerForm').onsubmit = (e) => {
        e.preventDefault();
        const customerData = {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            address: document.getElementById('customerAddress').value
        };
        addCustomer(customerData);
        updateCustomersTable();
        modal.remove();
        showNotification('Customer added successfully');
    };
}

function showAddBookingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Add New Booking</h3>
                <button class="close-btn">&times;</button>
            </div>
            <form id="addBookingForm">
                <div class="form-group">
                    <label for="bookingCustomer">Customer</label>
                    <select id="bookingCustomer" required>
                        ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="bookingTour">Tour</label>
                    <select id="bookingTour" required>
                        <option value="tour1">Victoria Falls Tour</option>
                        <option value="tour2">Safari Adventure</option>
                        <option value="tour3">City Tour</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bookingDate">Booking Date</label>
                    <input type="date" id="bookingDate" required>
                </div>
                <div class="form-group">
                    <label for="numberOfPeople">Number of People</label>
                    <input type="number" id="numberOfPeople" min="1" required>
                </div>
                <div class="form-group">
                    <label for="totalAmount">Total Amount (ZMW)</label>
                    <input type="number" id="totalAmount" min="0" step="0.01" required>
                </div>
                <button type="submit" class="btn-primary">Add Booking</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal functionality
    modal.querySelector('.close-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Form submission
    modal.querySelector('#addBookingForm').onsubmit = (e) => {
        e.preventDefault();
        const bookingData = {
            customerId: document.getElementById('bookingCustomer').value,
            tourId: document.getElementById('bookingTour').value,
            bookingDate: document.getElementById('bookingDate').value,
            numberOfPeople: parseInt(document.getElementById('numberOfPeople').value),
            totalAmount: parseFloat(document.getElementById('totalAmount').value)
        };
        const booking = addBooking(bookingData);
        updateBookingsTable();
        saveBookingForAdmin(booking);
        modal.remove();
        showNotification('Booking added successfully');
    };
}

function updateCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>
                <button class="btn-icon" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateBookingsTable() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    tbody.innerHTML = bookings.map(booking => {
        const customer = getCustomer(booking.customerId);
        return `
            <tr>
                <td>${booking.id}</td>
                <td>${customer ? customer.name : 'Unknown'}</td>
                <td>${booking.tourId}</td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${booking.status}">${booking.status}</span>
                </td>
                <td>
                    <button class="btn-icon" onclick="editBooking('${booking.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" onclick="deleteBooking('${booking.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize tables when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCustomersTable();
    updateBookingsTable();
}); 