// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');

// Form Switch Handlers
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Form Validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const inputGroup = formGroup.querySelector('.input-group');
    inputGroup.classList.add('error');
    
    let errorDiv = inputGroup.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        inputGroup.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

function clearError(input) {
    const formGroup = input.closest('.form-group');
    const inputGroup = formGroup.querySelector('.input-group');
    inputGroup.classList.remove('error');
    
    const errorDiv = inputGroup.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Icon toggle for password visibility
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
    // --- DOM Elements ---
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    const showForgotPassword = document.getElementById('showForgotPassword');
    const backToLogin = document.getElementById('backToLogin');
    const authError = document.getElementById('authError');

    // --- Utility Functions ---
    function clearAllMessages() {
        document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
        if (authError) {
            authError.style.display = 'none';
            authError.textContent = '';
        }
    }
    function showForm(form) {
        const forgotPasswordLink = document.getElementById('showForgotPassword');
        const forgotPasswordWrapper = forgotPasswordLink ? forgotPasswordLink.parentElement : null;
        [loginForm, signupForm, forgotPasswordForm].forEach(f => {
            if (f) {
                f.classList.remove('active');
                f.style.display = 'none';
                f.setAttribute('aria-hidden', 'true');
            }
        });
        if (form) {
            form.classList.add('active');
            form.style.display = 'block';
            form.setAttribute('aria-hidden', 'false');
            // Focus first input and scroll to top for mobile usability
            requestAnimationFrame(() => {
                const firstInput = form.querySelector('input, select, textarea, button');
                if (firstInput && typeof firstInput.focus === 'function') {
                    firstInput.focus({ preventScroll: true });
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        if (forgotPasswordWrapper) {
            forgotPasswordWrapper.style.display = (form === loginForm) ? 'block' : 'none';
        }
        clearAllMessages();
    }

    // --- Hash-based navigation helpers ---
    function formFromHash() {
        const hash = (window.location.hash || '').replace('#', '').toLowerCase();
        if (hash === 'signup') return signupForm;
        if (hash === 'forgot') return forgotPasswordForm;
        return loginForm;
    }
    function navigateTo(hash) {
        if (typeof hash === 'string') {
            window.location.hash = hash;
        }
    }

    // --- Form Switch Handlers (update hash for real navigation) ---
    if (showSignupLink) showSignupLink.onclick = e => { e.preventDefault(); navigateTo('signup'); };
    if (showLoginLink) showLoginLink.onclick = e => { e.preventDefault(); navigateTo('login'); };
    if (showForgotPassword) showForgotPassword.onclick = e => { e.preventDefault(); navigateTo('forgot'); };
    if (backToLogin) backToLogin.onclick = e => { e.preventDefault(); navigateTo('login'); };


    document.addEventListener('DOMContentLoaded', function() {
        // Select all forms and navigation links
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        const showSignupLink = document.getElementById('showSignup');
        const showLoginLink = document.getElementById('showLogin');
        const showForgotPasswordLink = document.getElementById('showForgotPassword');
        const backToLoginLink = document.getElementById('backToLogin');
        const authError = document.getElementById('authError');
    
        // Function to show a specific form and hide others
        function showForm(formToShow) {
            // Hide all forms
            [loginForm, signupForm, forgotPasswordForm].forEach(form => {
                form.classList.remove('active');
                form.classList.add('auth-form-hidden');
            });
    
            // Show the selected form
            formToShow.classList.add('active');
            formToShow.classList.remove('auth-form-hidden');
    
            // Clear any error messages
            authError.style.display = 'none';
            authError.textContent = '';
    
            // Update URL hash without reloading (GitHub Pages compatible)
            window.history.pushState(null, '', `#${formToShow.id.replace('Form', '').toLowerCase()}`);
        }
    
        // Event listeners for navigation links
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(signupForm);
        });
    
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(loginForm);
        });
    
        showForgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(forgotPasswordForm);
        });
    
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForm(loginForm);
        });
    
        // Handle initial form display based on URL hash
        function handleInitialForm() {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'signup') {
                showForm(signupForm);
            } else if (hash === 'forgot') {
                showForm(forgotPasswordForm);
            } else {
                showForm(loginForm); // Default to login
            }
        }
    
        // Run on page load
        handleInitialForm();
    
        // Handle browser back/forward navigation
        window.addEventListener('popstate', handleInitialForm);
    
        // Optional: Form submission handling (client-side validation only)
        [loginForm, signupForm, forgotPasswordForm].forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                authError.style.display = 'block';
                authError.textContent = 'Form submission is not implemented. This is a client-side demo for GitHub Pages.';
                // Add actual form submission logic here if backend is available
            });
        });
    
        // Terms modal handling
        const termsModal = document.getElementById('termsModal');
        const showTermsLink = document.getElementById('showTerms');
        const closeTerms = document.getElementById('closeTerms');
    
        showTermsLink.addEventListener('click', function(e) {
            e.preventDefault();
            termsModal.classList.remove('modal-hidden');
        });
    
        closeTerms.addEventListener('click', function() {
            termsModal.classList.add('modal-hidden');
        });
    
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === termsModal) {
                termsModal.classList.add('modal-hidden');
            }
        });
    });
    // --- Sync UI on hashchange ---
    window.addEventListener('hashchange', () => {
        showForm(formFromHash());
    });

    // --- Real-time Password Validation (Login) ---
    const loginPasswordInput = document.getElementById('loginPassword');
    if (loginPasswordInput) {
        loginPasswordInput.addEventListener('input', function() {
            const password = loginPasswordInput.value;
    if (!validatePassword(password)) {
                showError(loginPasswordInput, 'Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.');
            } else {
                clearError(loginPasswordInput);
            }
        });
    }

    // --- Login Handler ---
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            clearAllMessages();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            const contactNumber = document.getElementById('contactnumber') ? document.getElementById('contactnumber').value.trim() : '';
            let valid = true;
            if (!validateEmail(email)) {
                showError(document.getElementById('loginEmail'), 'Please enter a valid email address.');
                valid = false;
            }
            if (!validatePassword(password)) {
                showError(document.getElementById('loginPassword'), 'Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.');
                valid = false;
            }
            if (!valid) return;
            let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
            const foundUser = userLogins.find(u => u.email === email);
            if (!foundUser) {
                showError(document.getElementById('loginEmail'), 'No account found with this email.');
                return;
            }
            if (foundUser.password !== password) {
                showError(document.getElementById('loginPassword'), 'Incorrect password. Please try again.');
                return;
            }
            // Success
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.classList.add('loading');
            let successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Login successful! welcome...';
            loginForm.insertBefore(successDiv, loginForm.firstChild);
            if (rememberMe) localStorage.setItem('userEmail', email);
                localStorage.setItem('currentUser', JSON.stringify({
                name: foundUser.name || email.split('@')[0],
                email: foundUser.email,
                contactNumber: foundUser.contactNumber || contactNumber,
                password: foundUser.password
            }));
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1200);
            setTimeout(() => {
                submitButton.classList.remove('loading');
                if (successDiv && successDiv.parentNode) successDiv.parentNode.removeChild(successDiv);
            }, 2000);
        };
    }

    // --- Signup Handler ---
    if (signupForm) {
        signupForm.onsubmit = function(e) {
            e.preventDefault();
            clearAllMessages();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const contactNumber = document.getElementById('contactNumber').value.trim();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsAgree = document.getElementById('termsAgree').checked;
            let valid = true;
            if (name.length < 2) {
                showError(document.getElementById('signupName'), 'Name must be at least 2 characters.');
                valid = false;
            }
            if (!validateEmail(email)) {
                showError(document.getElementById('signupEmail'), 'Please enter a valid email address.');
                valid = false;
            }
            if (!validatePassword(password)) {
                showError(document.getElementById('signupPassword'), 'Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.');
                valid = false;
            }
            if (password !== confirmPassword) {
                showError(document.getElementById('confirmPassword'), 'Passwords do not match.');
                valid = false;
            }
            if (!termsAgree) {
                alert('Please agree to the Terms & Conditions');
                valid = false;
            }
            if (!valid) return;
            let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
            if (userLogins.some(u => u.email === email)) {
                showError(document.getElementById('signupEmail'), 'An account with this email already exists.');
                return;
            }
            const newUser = {
                name: name,
                email: email,
                contactNumber: contactNumber,
                password: password
            };
            userLogins.push(newUser);
            localStorage.setItem('userLogins', JSON.stringify(userLogins));
            let successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Account created successfully! Please login.';
            signupForm.insertBefore(successDiv, signupForm.firstChild);
            setTimeout(() => {
                showForm(loginForm);
                if (successDiv && successDiv.parentNode) successDiv.parentNode.removeChild(successDiv);
            }, 1800);
        };
    }

    // --- Forgot Password Handler ---
    if (forgotPasswordForm) {
        forgotPasswordForm.onsubmit = function(e) {
            e.preventDefault();
            clearAllMessages();
            const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            let valid = true;
            if (!validateEmail(email)) {
                showError(document.getElementById('forgotEmail'), 'Please enter a valid email address.');
                valid = false;
            }
            if (!validatePassword(newPassword)) {
                showError(document.getElementById('newPassword'), 'Password must be at least 8 characters, include 1 uppercase, 1 lowercase, and 1 number.');
                valid = false;
            }
            if (newPassword !== confirmNewPassword) {
                showError(document.getElementById('confirmNewPassword'), 'Passwords do not match.');
                valid = false;
            }
            if (!valid) return;
            let userLogins = JSON.parse(localStorage.getItem('userLogins')) || [];
            const userIndex = userLogins.findIndex(u => u.email === email);
            if (userIndex === -1) {
                showError(document.getElementById('forgotEmail'), 'No account found with this email.');
                return;
            }
            userLogins[userIndex].password = newPassword;
            localStorage.setItem('userLogins', JSON.stringify(userLogins));
            let successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Password reset successful! You can now log in.';
            forgotPasswordForm.insertBefore(successDiv, forgotPasswordForm.firstChild);
            setTimeout(() => {
                showForm(loginForm);
                if (successDiv && successDiv.parentNode) successDiv.parentNode.removeChild(successDiv);
            }, 1800);
        };
    }

    // --- Initial State: reflect URL hash ---
    showForm(formFromHash());
}); 