// profile.js
// Load and display the current user's profile details

document.addEventListener('DOMContentLoaded', function() {
    // Try to get the current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name || '';
        document.getElementById('profileEmail').textContent = currentUser.email || '';
        document.getElementById('profilenumber').textContent = currentUser.contactNumber || '';
    } else {
        document.getElementById('profileDetails').innerHTML = '<p>No user is currently logged in.</p>';
    }
}); 