// Contact Us page functionality

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validation
function validateEmail(email) {
  return emailRegex.test(email);
}

function showFieldError(input, message) {
  const field = input.closest('.contact-feedback__field');
  let errorMsg = field.querySelector('.contact-feedback__error');
  
  if (!errorMsg) {
    errorMsg = document.createElement('span');
    errorMsg.className = 'contact-feedback__error';
    field.appendChild(errorMsg);
  }
  
  errorMsg.textContent = message;
  input.style.borderColor = '#ff0000';
}

function removeFieldError(input) {
  const field = input.closest('.contact-feedback__field');
  const errorMsg = field.querySelector('.contact-feedback__error');
  
  if (errorMsg) {
    errorMsg.remove();
  }
  
  input.style.borderColor = 'rgba(185, 39, 112, 0.5)';
}

function showMessage(message, isSuccess = true) {
  const messageEl = document.getElementById('feedback-message');
  if (!messageEl) return;
  
  messageEl.textContent = message;
  messageEl.className = `contact-feedback__message ${isSuccess ? 'contact-feedback__message--success' : 'contact-feedback__message--error'}`;
  messageEl.style.display = 'block';
  
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 5000);
}

function setupEmailValidation() {
  const emailInput = document.getElementById('email');
  if (!emailInput) return;
  
  emailInput.addEventListener('blur', () => {
    const email = emailInput.value.trim();
    if (email && !validateEmail(email)) {
      showFieldError(emailInput, 'Please enter a valid email address');
    } else {
      removeFieldError(emailInput);
    }
  });
  
  emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();
    if (email && validateEmail(email)) {
      removeFieldError(emailInput);
    }
  });
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const topic = document.getElementById('topic').value.trim();
  const message = document.getElementById('message').value.trim();
  
  const messageEl = document.getElementById('feedback-message');
  if (messageEl) {
    messageEl.style.display = 'none';
  }
  
  let isValid = true;
  
  if (!name) {
    showFieldError(document.getElementById('name'), 'This field is required');
    isValid = false;
  } else {
    removeFieldError(document.getElementById('name'));
  }
  
  if (!email) {
    showFieldError(document.getElementById('email'), 'This field is required');
    isValid = false;
  } else if (!validateEmail(email)) {
    showFieldError(document.getElementById('email'), 'Please enter a valid email address');
    isValid = false;
  } else {
    removeFieldError(document.getElementById('email'));
  }
  
  if (!topic) {
    showFieldError(document.getElementById('topic'), 'This field is required');
    isValid = false;
  } else {
    removeFieldError(document.getElementById('topic'));
  }
  
  if (!message) {
    showFieldError(document.getElementById('message'), 'This field is required');
    isValid = false;
  } else {
    removeFieldError(document.getElementById('message'));
  }
  
  if (!isValid) {
    showMessage('Please fill in all required fields correctly', false);
    return;
  }
  
  showMessage('Thank you! Your feedback has been submitted successfully.', true);
  
  form.reset();
  
  document.querySelectorAll('.contact-feedback__error').forEach(error => error.remove());
  document.querySelectorAll('.contact-feedback__input, .contact-feedback__textarea').forEach(input => {
    input.style.borderColor = 'rgba(185, 39, 112, 0.5)';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
  
  setupEmailValidation();
});

