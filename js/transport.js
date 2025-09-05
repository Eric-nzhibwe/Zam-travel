// transport.js - Functionality for transport.html

document.addEventListener('DOMContentLoaded', function() {
    // Booking form functionality
    const bookingForm = document.querySelector('.transport-booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Get form values
            const type = document.getElementById('transportType').value;
            const from = document.getElementById('from').value;
            const to = document.getElementById('to').value;
            const date = document.getElementById('date').value;
            const people = document.getElementById('people').value;

            // Simple validation
            if (!type || !from || !to || !date || !people) {
                alert('Please fill in all fields.');
                return;
            }

            // Show a simple confirmation (could be replaced with a modal)
            alert(`Booking confirmed!\n\nType: ${type}\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nPeople: ${people}`);
            bookingForm.reset();
        });
    }

    // FAQ toggle (if you want to make FAQs collapsible)
    const faqList = document.querySelector('.faq-list');
    if (faqList) {
        faqList.querySelectorAll('li').forEach(function(item) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function() {
                if (item.childNodes.length > 1) {
                    // Toggle answer if you add answer spans
                }
            });
        });
    }

    // Highlight selected transport option (optional UI effect)
    const transportItems = document.querySelectorAll('.transport-item');
    transportItems.forEach(function(item) {
        item.addEventListener('click', function() {
            transportItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            // Optionally set the booking form's transport type
            const type = item.querySelector('h3').textContent;
            document.getElementById('transportType').value = type;
        });
    });
});
