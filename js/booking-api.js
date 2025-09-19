// booking-api.js
// A client-side function to save booking details into localStorage so they appear in the Admin Dashboard.
// Works offline and away from GitHub; if the admin page is open on the same origin, it will auto-refresh via the 'storage' event.

(function(){
  function generateBookingId() {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const ts = Date.now().toString().slice(-5);
    return `BK-${ts}-${rand}`;
  }

  function getBookings() {
    try { return JSON.parse(localStorage.getItem('bookings')) || []; } catch(e) { return []; }
  }
  function setBookings(v) {
    localStorage.setItem('bookings', JSON.stringify(v));
  }

  function normalizeBooking(b) {
    const copy = { ...b };
    if (!copy.bookingId && copy.bookingID) copy.bookingId = copy.bookingID;
    if (!copy.bookingId) copy.bookingId = generateBookingId();
    copy.tour = copy.tour || copy.tourName || '';
    copy.customerName = copy.customerName || copy.name || '';
    copy.email = copy.email || '';
    copy.date = copy.date || '';
    copy.people = copy.people != null ? copy.people : copy.guests;
    copy.amount = copy.amount != null ? copy.amount : copy.price;
    copy.payment = copy.payment || 'Unpaid';
    copy.approved = !!copy.approved; // default false
    return copy;
  }

  // Public API: saveBookingClientSide
  // - Saves booking to localStorage so the admin dashboard can see it.
  // - If window.saveBookingToAdmin is available (admin JS loaded), it uses that directly.
  // - Returns the bookingId used.
  function saveBookingClientSide(booking, options = { overwriteIfSameId: false }) {
    // If admin's API is available in this context, use it
    if (typeof window.saveBookingToAdmin === 'function') {
      return window.saveBookingToAdmin(booking, options);
    }
    // Otherwise, write directly to localStorage
    const b = normalizeBooking(booking);
    let list = getBookings();
    const idx = list.findIndex(x => (x.bookingId || x.bookingID) === b.bookingId);
    if (idx >= 0) {
      if (options.overwriteIfSameId) {
        list[idx] = { ...list[idx], ...b };
      } else {
        b.bookingId = generateBookingId();
        list.push(b);
      }
    } else {
      list.push(b);
    }
    setBookings(list);
    // Triggering setBookings emits 'storage' event to other tabs (admin) on same origin
    return b.bookingId;
  }

  // Expose globally
  window.saveBookingClientSide = saveBookingClientSide;
})();
