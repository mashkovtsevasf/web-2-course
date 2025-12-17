// Layout components - Header and Footer

function getBasePath() {
  const path = window.location.pathname;
  const isSubPage = path.includes('/html/');
  const isRoot = path === '/' || path.endsWith('/index.html') || path.endsWith('/');
  
  const srcPath = '/src';
  const slash = '/';
  
  if (isSubPage) {
    return `${srcPath}${slash}`;
  }
  if (isRoot) {
    return `${srcPath}${slash}`;
  }
  return `${srcPath}${slash}`;
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('catalog.html')) return 'catalog';
  if (path.includes('about.html')) return 'about';
  if (path.includes('contact.html')) return 'contact';
  if (path.includes('cart.html')) return 'cart';
  if (path.includes('product')) return 'product';
  return 'home';
}

function loadHeader() {
  const basePath = getBasePath();
  const currentPage = getCurrentPage();
  const loggedIn = isLoggedIn();
  const userRole = localStorage.getItem('userRole') || 'guest';
  
  // Determine account button based on login status
  let accountButtonHTML = '';
  if (loggedIn) {
    if (userRole === 'admin') {
      accountButtonHTML = `
        <div class="header__user-menu">
          <a href="${basePath}html/admin.html" class="header__icon-btn" id="account-btn" aria-label="Admin Panel">
            <img src="${basePath}assets/images/homepage/user.svg" alt="Admin">
          </a>
          <div class="header__user-dropdown" id="user-dropdown" style="display: none;">
            <a href="${basePath}html/admin.html" class="header__user-link">Admin Panel</a>
            <a href="${basePath}html/profile.html" class="header__user-link">Profile</a>
            <button class="header__user-link header__user-link--logout" id="logout-btn">Logout</button>
          </div>
        </div>
      `;
    } else {
      accountButtonHTML = `
        <a href="${basePath}html/profile.html" class="header__icon-btn" id="account-btn" aria-label="Profile">
          <img src="${basePath}assets/images/homepage/user.svg" alt="Account">
        </a>
      `;
    }
  } else {
    accountButtonHTML = `
      <button class="header__icon-btn" id="account-btn" aria-label="Account">
        <img src="${basePath}assets/images/homepage/user.svg" alt="Account">
      </button>
    `;
  }
  
  const headerHTML = `
    <header class="header">
      <div class="header__top">
        <div class="container">
          <div class="header__top-content">
            <ul class="header__social">
              <li><a href="#" aria-label="Facebook"><img src="${basePath}assets/images/homepage/facebook.svg" alt="Facebook"></a></li>
              <li><a href="#" aria-label="Twitter"><img src="${basePath}assets/images/homepage/twitter.svg" alt="Twitter"></a></li>
              <li><a href="#" aria-label="Instagram"><img src="${basePath}assets/images/homepage/instagram.svg" alt="Instagram"></a></li>
            </ul>
            <button class="header__burger" id="burger-menu" aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div class="header__logo">
              <a href="${basePath}index.html" style="display: flex; align-items: center; gap: 13px; text-decoration: none;">
                <img src="${basePath}assets/images/homepage/logo.png" alt="Best Shop">
                <span class="header__logo-text">BEST SHOP</span>
              </a>
            </div>
            <div class="header__actions">
              ${accountButtonHTML}
              <a href="${basePath}html/cart.html" class="header__icon-btn" aria-label="Cart" id="cart-link">
                <img src="${basePath}assets/images/homepage/shopping-cart.svg" alt="Cart">
                <span class="header__cart-count" id="cart-count" style="display: none;">0</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <nav class="header__nav" id="header-nav">
        <div class="container">
          <ul class="header__nav-list">
            <li><a href="${basePath}index.html" class="header__nav-link ${currentPage === 'home' ? 'header__nav-link--active' : ''}">Home</a></li>
            <li class="header__nav-item--dropdown">
              <a href="${basePath}html/catalog.html" class="header__nav-link ${currentPage === 'catalog' ? 'header__nav-link--active' : ''}">
                Catalog
                <img src="${basePath}assets/images/homepage/arrow-down.svg" alt="" class="header__nav-arrow">
              </a>
              <ul class="header__dropdown-menu">
                <li><a href="${basePath}html/catalog.html?category=suitcases" class="header__dropdown-link">Suitcases</a></li>
                <li><a href="${basePath}html/catalog.html?category=carry-ons" class="header__dropdown-link">Carry-ons</a></li>
                <li><a href="${basePath}html/catalog.html?category=luggage sets" class="header__dropdown-link">Luggage Sets</a></li>
                <li><a href="${basePath}html/catalog.html?category=kids' luggage" class="header__dropdown-link">Kids' Luggage</a></li>
              </ul>
            </li>
            <li><a href="${basePath}html/about.html" class="header__nav-link ${currentPage === 'about' ? 'header__nav-link--active' : ''}">About Us</a></li>
            <li><a href="${basePath}html/contact.html" class="header__nav-link ${currentPage === 'contact' ? 'header__nav-link--active' : ''}">Contact Us</a></li>
          </ul>
          <ul class="header__social header__social--mobile">
            <li><a href="#" aria-label="Facebook"><img src="${basePath}assets/images/homepage/facebook.svg" alt="Facebook"></a></li>
            <li><a href="#" aria-label="Twitter"><img src="${basePath}assets/images/homepage/twitter.svg" alt="Twitter"></a></li>
            <li><a href="#" aria-label="Instagram"><img src="${basePath}assets/images/homepage/instagram.svg" alt="Instagram"></a></li>
          </ul>
        </div>
      </nav>
    </header>
  `;
  
  const headerPlaceholder = document.querySelector('[data-header]');
  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = headerHTML;
  } else {
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
  }
  
  // Setup user menu dropdown for admin
  if (loggedIn && userRole === 'admin') {
    const accountBtn = document.getElementById('account-btn');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (accountBtn && userDropdown) {
      accountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
      });
      
      document.addEventListener('click', (e) => {
        if (!accountBtn.contains(e.target) && !userDropdown.contains(e.target)) {
          userDropdown.style.display = 'none';
        }
      });
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        logout();
      });
    }
  }
  
}

// Global logout function - clears all user data
function logout() {
  console.log('Logout called');
  
  // Clear API session
  if (typeof window !== 'undefined' && window.apiClient) {
    try {
      if (window.apiClient.isAuthenticated && window.apiClient.isAuthenticated()) {
        window.apiClient.logout().catch(err => console.error('API logout error:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  // Clear all user data from localStorage
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userAddress');
  
  // Clear cart data
  localStorage.removeItem('cart');
  
  console.log('All user data cleared');
  
  // Reload header to show login button
  if (typeof loadHeader === 'function') {
    loadHeader();
  }
  
  // Re-initialize login modal for the new login button
  setTimeout(() => {
    if (typeof initLoginModal === 'function') {
      initLoginModal();
    }
  }, 100);
  
  // Redirect to home page
  const basePath = typeof getBasePath === 'function' ? getBasePath() : '/src/';
  window.location.href = `${basePath}index.html`;
}

// Load footer
function loadFooter() {
  const basePath = getBasePath();
  
  const footerHTML = `
    <footer class="footer">
      <section class="benefits">
        <div class="container">
          <h2 class="benefits__title">Our Benefits</h2>
          <div class="benefits__grid">
            <article class="benefit-card">
              <img src="${basePath}assets/images/homepage/benefits-world-pin.svg" alt="World" class="benefit-card__icon">
              <p class="benefit-card__text">Dolor eu varius. Morbi fermentum velit nisl.</p>
            </article>
            <article class="benefit-card">
              <img src="${basePath}assets/images/homepage/benefits-car-pin.svg" alt="Car" class="benefit-card__icon">
              <p class="benefit-card__text">Dolor eu varius. Morbi fermentum velit nisl.</p>
            </article>
            <article class="benefit-card">
              <img src="${basePath}assets/images/homepage/benefits-money-pin.svg" alt="Money" class="benefit-card__icon">
              <p class="benefit-card__text">Malesuada fames ac ante ipsum primis in faucibus.</p>
            </article>
            <article class="benefit-card">
              <img src="${basePath}assets/images/homepage/benefits-study-pin.svg" alt="Study" class="benefit-card__icon">
              <p class="benefit-card__text">Nisl sodales eget donec quis. volutpat orci.</p>
            </article>
          </div>
        </div>
      </section>
      <div class="container">
        <div class="footer__top">
          <div class="footer__top-left">
            <div class="footer__column">
              <h3 class="footer__title"><a href="${basePath}html/about.html" class="footer__title-link">About Us</a></h3>
              <ul class="footer__list">
                <li><a href="#" class="footer__link">Organisation</a></li>
                <li><a href="#" class="footer__link">Partners</a></li>
                <li><a href="#" class="footer__link">Clients</a></li>
              </ul>
            </div>
            <div class="footer__column">
              <h3 class="footer__title">Interesting Links</h3>
              <ul class="footer__list">
                <li><a href="#" class="footer__link">Photo Gallery</a></li>
                <li><a href="#" class="footer__link">Our Team</a></li>
                <li><a href="#" class="footer__link">Socials</a></li>
              </ul>
            </div>
            <div class="footer__column">
              <h3 class="footer__title">Achievements</h3>
              <ul class="footer__list">
                <li><a href="#" class="footer__link">Winning Awards</a></li>
                <li><a href="#" class="footer__link">Press</a></li>
                <li><a href="#" class="footer__link">Our Amazing Clients</a></li>
              </ul>
            </div>
          </div>
          <div class="footer__top-right">
            <div class="footer__column">
              <h3 class="footer__title"><a href="${basePath}html/contact.html" class="footer__title-link">Contact Us</a></h3>
              <p class="footer__text">Bendum dolor eu varius. Morbi fermentum velitsodales egetonec. volutpat orci. Sed ipsum felis, tristique egestas et, convallis ac velitn consequat nec luctus.</p>
            </div>
          </div>
        </div>
        <div class="footer__bottom">
          <div class="footer__shipping">
            <h3 class="footer__title">Shipping Information</h3>
            <p class="footer__text">Nulla eleifend pulvinar purus, molestie euismod odio imperdiet ac. Ut sit amet erat nec nibh rhoncus varius in non lorem. Donec interdum, lectus in convallis pulvinar, enim elit porta sapien, vel finibus erat felis sed neque. Etiam aliquet neque sagittis erat tincidunt aliquam.</p>
          </div>
          <div class="footer__contact">
            <div class="footer__contact-column">
              <div class="footer__contact-item">
                <img src="${basePath}assets/images/homepage/footer-phone-pin.svg" alt="Phone" class="footer__icon">
                <a href="tel:+632366322" class="footer__contact-text">Phone: (+63) 236 6322</a>
              </div>
              <div class="footer__contact-item">
                <img src="${basePath}assets/images/homepage/footer-clock-pin.svg" alt="Working Hours" class="footer__icon">
                <div class="footer__contact-text">
                  <div>Mon - Fri: 10am - 6pm</div>
                  <div>Sat - Sun: 10am - 6pm</div>
                </div>
              </div>
            </div>
            <div class="footer__contact-column">
              <div class="footer__contact-item">
                <img src="${basePath}assets/images/homepage/footer-mail-pin.svg" alt="Email" class="footer__icon">
                <a href="mailto:public@news.com" class="footer__contact-text">public@news.com</a>
              </div>
              <div class="footer__contact-item">
                <img src="${basePath}assets/images/homepage/footer-map-pin.svg" alt="Address" class="footer__icon">
                <div class="footer__contact-text">
                  <div>639 Jade Valley,</div>
                  <div>Washington Dc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer__copyright">
          <p>© Copyright 2025</p>
        </div>
      </div>
    </footer>
  `;
  
  const footerPlaceholder = document.querySelector('[data-footer]');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = footerHTML;
  } else {
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  }
}

// Load offer banner
function loadOfferBanner() {
  const basePath = getBasePath();
  
  const offerHTML = `
    <section class="offer-banner">
      <div class="container">
        <div class="offer-banner__content">
          <div class="offer-banner__left">
            <div class="offer-banner__percentage">50%</div>
            <p class="offer-banner__text">Curabitur vulputate arcu odio, ac facilisis diam.</p>
          </div>
          <div class="offer-banner__right">
            <h2 class="offer-banner__title">Offer Of The Month</h2>
            <p class="offer-banner__description">
              Curabitur vulputate arcu odio, ac facilisis diam accumsan ut. Ut imperdiet et leo in vulputate.
            </p>
            <a href="${basePath}html/catalog.html" class="btn btn--primary">Get Offer Today</a>
          </div>
        </div>
      </div>
    </section>
  `;
  
  const offerPlaceholder = document.querySelector('[data-offer-banner]');
  if (offerPlaceholder) {
    offerPlaceholder.innerHTML = offerHTML;
  }
}

// Cart management
function getCartFromStorage() {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
}

function saveCartToStorage(cart) {
  // Additional check before saving - prevent saving if user is not logged in
  const loggedIn = isLoggedIn();
  if (!loggedIn) {
    console.log('BLOCKING saveCartToStorage: User not logged in');
    return false;
  }
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    return true;
  } catch (error) {
    console.error('Error saving cart:', error);
    return false;
  }
}

// Check if user is logged in
function isLoggedIn() {
  // First check API client if available
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated) {
    try {
      const apiAuth = window.apiClient.isAuthenticated();
      if (apiAuth) {
        console.log('User logged in via API');
        return true;
      }
    } catch (e) {
      console.log('API auth check failed:', e);
    }
  }
  
  // Check localStorage - must have explicit login flag
  const isLoggedInStorage = localStorage.getItem('isLoggedIn');
  const hasAuthToken = localStorage.getItem('authToken');
  const hasUserEmail = localStorage.getItem('userEmail');
  const hasUserRole = localStorage.getItem('userRole');
  
  console.log('isLoggedIn check:', {
    isLoggedInStorage,
    hasAuthToken: !!hasAuthToken,
    hasUserEmail: !!hasUserEmail,
    hasUserRole
  });
  
  // User is logged in only if explicitly marked as logged in AND has user data
  const isLoggedIn = isLoggedInStorage === 'true' && 
                     (hasAuthToken || (hasUserEmail && hasUserRole && hasUserRole !== 'guest'));
  
  console.log('Final isLoggedIn result:', isLoggedIn);
  return isLoggedIn;
}

// Function to open login modal
function openLoginModal() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function addItemToCart(productId, quantity, productData) {
  // Check if user is logged in - STRICT CHECK
  const loggedIn = isLoggedIn();
  
  console.log('=== addItemToCart called ===');
  console.log('Product ID:', productId);
  console.log('User logged in:', loggedIn);
  
  if (!loggedIn) {
    console.log('BLOCKING: User not logged in, preventing cart addition');
    // Show message and open login modal
    alert('Будь ласка, увійдіть в акаунт або зареєструйтеся, щоб додати товар в корзину');
    setTimeout(() => {
      openLoginModal();
    }, 100);
    return false;
  }
  
  console.log('ALLOWING: User is logged in, adding to cart');
  
  const cart = getCartFromStorage();
  const size = productData.size || '';
  const color = productData.color || '';
  
  const matchingItem = cart.find(item => 
    item.name === productData.name && 
    item.size === size && 
    item.color === color
  );
  
  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {
    cart.push({
      id: productId,
      name: productData.name,
      price: productData.price,
      quantity: quantity,
      image: productData.image,
      size: size,
      color: color
    });
  }
  
  const saved = saveCartToStorage(cart);
  if (!saved) {
    console.error('Failed to save cart - user not logged in');
    return false;
  }
  
  return true;
}

function updateCartCounter() {
  const cart = getCartFromStorage();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.getElementById('cart-count');
  
  if (cartCountEl) {
    if (totalItems > 0) {
      cartCountEl.textContent = totalItems;
      cartCountEl.style.display = 'flex';
    } else {
      cartCountEl.style.display = 'none';
    }
  }
}

// Navigation
function initBurgerMenu() {
  const burgerBtn = document.getElementById('burger-menu');
  const nav = document.getElementById('header-nav');
  
  if (burgerBtn && nav) {
    burgerBtn.addEventListener('click', () => {
      burgerBtn.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    nav.addEventListener('click', (e) => {
      if (e.target === nav) {
        burgerBtn.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    const navLinks = nav.querySelectorAll('.header__nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerBtn.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    const dropdownItems = nav.querySelectorAll('.header__nav-item--dropdown');
    dropdownItems.forEach(item => {
      const link = item.querySelector('.header__nav-link');
      const arrow = item.querySelector('.header__nav-arrow');
      const menu = item.querySelector('.header__dropdown-menu');
      
      const toggleDropdown = (e) => {
        if (window.innerWidth <= 1024 && nav.classList.contains('active')) {
          e.preventDefault();
          e.stopPropagation();
          menu.classList.toggle('active');
        }
      };
      
      if (link && menu) {
        link.addEventListener('click', toggleDropdown);
      }
      
      if (arrow && menu) {
        arrow.addEventListener('click', toggleDropdown);
      }
    });
  }
}

// Login modal
function loadLoginModal() {
  const modalHTML = `
    <div class="login-modal" id="login-modal" style="display: none;">
      <div class="login-modal__overlay"></div>
      <div class="login-modal__content">
        <form class="login-modal__form" id="login-form">
          <div class="login-modal__field">
            <label for="login-email" class="login-modal__label">
              Email address<span class="login-modal__required">*</span>
            </label>
            <input 
              type="email" 
              id="login-email" 
              name="email" 
              class="login-modal__input" 
              placeholder="Enter your email"
              required
            >
            <span class="login-modal__error" id="email-error"></span>
          </div>
          
          <div class="login-modal__field">
            <label for="login-password" class="login-modal__label">
              Password<span class="login-modal__required">*</span>
            </label>
            <div class="login-modal__password-wrapper">
              <input 
                type="password" 
                id="login-password" 
                name="password" 
                class="login-modal__input" 
                placeholder="Enter your password"
                required
              >
              <button 
                type="button" 
                class="login-modal__toggle-password" 
                id="toggle-password"
                aria-label="Toggle password visibility"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5.5 3 1.73 6.11 0 10.5C1.73 14.89 5.5 18 10 18C14.5 18 18.27 14.89 20 10.5C18.27 6.11 14.5 3 10 3ZM10 15.5C7.52 15.5 5.5 13.48 5.5 11C5.5 8.52 7.52 6.5 10 6.5C12.48 6.5 14.5 8.52 14.5 11C14.5 13.48 12.48 15.5 10 15.5ZM10 8C8.62 8 7.5 9.12 7.5 10.5C7.5 11.88 8.62 13 10 13C11.38 13 12.5 11.88 12.5 10.5C12.5 9.12 11.38 8 10 8Z" fill="#727174"/>
                </svg>
              </button>
            </div>
            <span class="login-modal__error" id="password-error"></span>
          </div>
          
          <div class="login-modal__options">
            <label class="login-modal__checkbox-label">
              <input type="checkbox" name="remember" class="login-modal__checkbox">
              <span>Remember me</span>
            </label>
            <a href="#" class="login-modal__forgot-link">Forgot Your Password?</a>
          </div>
          
          <button type="submit" class="login-modal__submit btn btn--primary">LOG IN</button>
          
          <div class="login-modal__register-link">
            <p>Don't have an account? <a href="#" id="register-link">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function initLoginModal() {
  const accountBtn = document.getElementById('account-btn');
  const loginModal = document.getElementById('login-modal');
  const loginForm = document.getElementById('login-form');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('login-password');
  const emailInput = document.getElementById('login-email');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const registerLink = document.getElementById('register-link');
  
  if (!loginModal) return;
  
  // Check if user is already logged in - if yes, don't setup login modal
  const loggedIn = isLoggedIn();
  if (loggedIn) {
    console.log('User is logged in, skipping login modal setup');
    return; // If logged in, account button should be a link, not open modal
  }
  
  // Handle register link click
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeLoginModal();
      openRegisterModal();
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Use event delegation for account-btn (works even after header reload)
  if (accountBtn) {
    // Remove existing event listeners by cloning and replacing
    const newAccountBtn = accountBtn.cloneNode(true);
    accountBtn.parentNode.replaceChild(newAccountBtn, accountBtn);
    
    newAccountBtn.addEventListener('click', (e) => {
      // Only open modal if user is not logged in
      if (!isLoggedIn()) {
        e.preventDefault();
        e.stopPropagation();
        if (loginModal) {
          loginModal.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      }
      // If logged in, let the link work normally
    });
  }
  
  const overlay = loginModal.querySelector('.login-modal__overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeLoginModal();
    });
  }
  
  function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = '';
    loginForm.reset();
    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('login-modal__input--error');
    passwordInput.classList.remove('login-modal__input--error');
  }
  
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const svg = togglePasswordBtn.querySelector('svg');
      if (type === 'text') {
        svg.style.opacity = '0.5';
      } else {
        svg.style.opacity = '1';
      }
    });
  }
  
  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      validateEmail();
    });
    
    emailInput.addEventListener('input', () => {
      if (emailError.textContent) {
        validateEmail();
      }
    });
  }
  
  function validateEmail() {
    const email = emailInput.value.trim();
    if (!email) {
      emailError.textContent = '';
      emailInput.classList.remove('login-modal__input--error');
      return false;
    }
    
    if (!emailRegex.test(email)) {
      emailError.textContent = 'Please enter a valid email address';
      emailInput.classList.add('login-modal__input--error');
      return false;
    } else {
      emailError.textContent = '';
      emailInput.classList.remove('login-modal__input--error');
      return true;
    }
  }
  
  // Password validation
  function validatePassword() {
    const password = passwordInput.value;
    if (!password) {
      passwordError.textContent = 'Password is required';
      passwordInput.classList.add('login-modal__input--error');
      return false;
    } else {
      passwordError.textContent = '';
      passwordInput.classList.remove('login-modal__input--error');
      return true;
    }
  }
  
  // Helper functions for user management
  function getRegisteredUsers() {
    try {
      const users = localStorage.getItem('registeredUsers');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      return [];
    }
  }
  
  function findUser(email, password) {
    const users = getRegisteredUsers();
    return users.find(u => u.email === email && u.password === password);
  }
  
  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Login form submitted');
      
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      
      if (!isEmailValid || !isPasswordValid) {
        console.log('Validation failed');
        return;
      }
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      console.log('Attempting login for:', email);
      
      // Try API login first
      if (typeof window !== 'undefined' && window.apiClient) {
        try {
          const response = await window.apiClient.login(email, password);
          console.log('API login response:', response);
          
          if (response.token && response.user) {
            const user = response.user;
            const userRoles = user.roles || [];
            const userRole = userRoles.includes('admin') ? 'admin' : 'user';
            
            // Save user session
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.name || (userRole === 'admin' ? 'Admin' : user.email));
            localStorage.setItem('isLoggedIn', 'true');
            
            if (user.phone) {
              localStorage.setItem('userPhone', user.phone);
            }
            if (user.address) {
              localStorage.setItem('userAddress', user.address);
            }
            
            console.log('Login successful via API');
            closeLoginModal();
            
            // Reload header to show user info
            if (typeof loadHeader === 'function') {
              loadHeader();
            }
            
            // Redirect based on role
            setTimeout(() => {
              if (userRole === 'admin') {
                window.location.href = `${getBasePath()}html/admin.html`;
              } else {
                window.location.href = `${getBasePath()}index.html`;
              }
            }, 300);
            return;
          }
        } catch (error) {
          console.error('API login error:', error);
          // Fall through to localStorage check
        }
      }
      
      // Fallback to localStorage
      const user = findUser(email, password);
      if (user) {
        let userRole = user.role || 'user';
        if (email === 'admin@bestshop.com') {
          userRole = 'admin';
        }
        
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.name || (userRole === 'admin' ? 'Admin' : user.email));
        localStorage.setItem('isLoggedIn', 'true');
        
        if (user.phone) {
          localStorage.setItem('userPhone', user.phone);
        }
        if (user.address) {
          localStorage.setItem('userAddress', user.address);
        }
        
        console.log('Login successful via localStorage');
        closeLoginModal();
        
        // Reload header to show user info
        if (typeof loadHeader === 'function') {
          loadHeader();
        }
        
        // Redirect based on role
        setTimeout(() => {
          if (userRole === 'admin') {
            window.location.href = `${getBasePath()}html/admin.html`;
          } else {
            window.location.href = `${getBasePath()}index.html`;
          }
        }, 300);
      } else {
        console.log('Login failed - user not found');
        passwordError.textContent = 'Невірний email або пароль';
        passwordInput.classList.add('login-modal__input--error');
      }
    });
  }
}

// Register modal
function loadRegisterModal() {
  // Check if modal already exists
  if (document.getElementById('register-modal')) {
    return;
  }
  
  const modalHTML = `
    <div class="login-modal" id="register-modal" style="display: none;">
      <div class="login-modal__overlay"></div>
      <div class="login-modal__content">
        <form class="login-modal__form" id="register-form">
          <h2 style="margin-bottom: 20px; font-size: 24px; font-weight: 700;">Sign Up</h2>
          
          <div class="login-modal__field">
            <label for="register-name" class="login-modal__label">
              Name<span class="login-modal__required">*</span>
            </label>
            <input 
              type="text" 
              id="register-name" 
              name="name" 
              class="login-modal__input" 
              placeholder="Enter your name"
              required
            >
            <span class="login-modal__error" id="register-name-error"></span>
          </div>
          
          <div class="login-modal__field">
            <label for="register-email" class="login-modal__label">
              Email address<span class="login-modal__required">*</span>
            </label>
            <input 
              type="email" 
              id="register-email" 
              name="email" 
              class="login-modal__input" 
              placeholder="Enter your email"
              required
            >
            <span class="login-modal__error" id="register-email-error"></span>
          </div>
          
          <div class="login-modal__field">
            <label for="register-password" class="login-modal__label">
              Password<span class="login-modal__required">*</span>
            </label>
            <div class="login-modal__password-wrapper">
              <input 
                type="password" 
                id="register-password" 
                name="password" 
                class="login-modal__input" 
                placeholder="Enter your password"
                required
                minlength="8"
              >
              <button 
                type="button" 
                class="login-modal__toggle-password" 
                id="toggle-register-password"
                aria-label="Toggle password visibility"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 3C5.5 3 1.73 6.11 0 10.5C1.73 14.89 5.5 18 10 18C14.5 18 18.27 14.89 20 10.5C18.27 6.11 14.5 3 10 3ZM10 15.5C7.52 15.5 5.5 13.48 5.5 11C5.5 8.52 7.52 6.5 10 6.5C12.48 6.5 14.5 8.52 14.5 11C14.5 13.48 12.48 15.5 10 15.5ZM10 8C8.62 8 7.5 9.12 7.5 10.5C7.5 11.88 8.62 13 10 13C11.38 13 12.5 11.88 12.5 10.5C12.5 9.12 11.38 8 10 8Z" fill="#727174"/>
                </svg>
              </button>
            </div>
            <span class="login-modal__error" id="register-password-error"></span>
          </div>
          
          <div class="login-modal__field">
            <label for="register-phone" class="login-modal__label">
              Phone (optional)
            </label>
            <input 
              type="tel" 
              id="register-phone" 
              name="phone" 
              class="login-modal__input" 
              placeholder="Enter your phone number"
            >
            <span class="login-modal__error" id="register-phone-error"></span>
          </div>
          
          <div class="login-modal__field">
            <label for="register-address" class="login-modal__label">
              Address (optional)
            </label>
            <input 
              type="text" 
              id="register-address" 
              name="address" 
              class="login-modal__input" 
              placeholder="Enter your address"
            >
            <span class="login-modal__error" id="register-address-error"></span>
          </div>
          
          <button type="submit" class="login-modal__submit btn btn--primary">SIGN UP</button>
          
          <div class="login-modal__register-link">
            <p>Already have an account? <a href="#" id="login-link">Log in</a></p>
          </div>
        </form>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  initRegisterModal();
}

function openRegisterModal() {
  const registerModal = document.getElementById('register-modal');
  if (registerModal) {
    registerModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeRegisterModal() {
  const registerModal = document.getElementById('register-modal');
  const registerForm = document.getElementById('register-form');
  if (registerModal) {
    registerModal.style.display = 'none';
    document.body.style.overflow = '';
    if (registerForm) {
      registerForm.reset();
    }
  }
}

function initRegisterModal() {
  const registerModal = document.getElementById('register-modal');
  const registerForm = document.getElementById('register-form');
  const loginLink = document.getElementById('login-link');
  const togglePasswordBtn = document.getElementById('toggle-register-password');
  const passwordInput = document.getElementById('register-password');
  const emailInput = document.getElementById('register-email');
  const nameInput = document.getElementById('register-name');
  
  if (!registerModal || !registerForm) return;
  
  // Handle login link click
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeRegisterModal();
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        loginModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  }
  
  const overlay = registerModal.querySelector('.login-modal__overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeRegisterModal();
    });
  }
  
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      const svg = togglePasswordBtn.querySelector('svg');
      if (type === 'text') {
        svg.style.opacity = '0.5';
      } else {
        svg.style.opacity = '1';
      }
    });
  }
  
  // Form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const phone = document.getElementById('register-phone') ? document.getElementById('register-phone').value.trim() : '';
      const address = document.getElementById('register-address') ? document.getElementById('register-address').value.trim() : '';
      
      const emailError = document.getElementById('register-email-error');
      const passwordError = document.getElementById('register-password-error');
      const nameError = document.getElementById('register-name-error');
      
      // Validation
      let isValid = true;
      
      if (!name) {
        if (nameError) nameError.textContent = 'Name is required';
        isValid = false;
      } else {
        if (nameError) nameError.textContent = '';
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address';
        isValid = false;
      } else {
        if (emailError) emailError.textContent = '';
      }
      
      if (!password || password.length < 8) {
        if (passwordError) passwordError.textContent = 'Password must be at least 8 characters';
        isValid = false;
      } else {
        if (passwordError) passwordError.textContent = '';
      }
      
      if (!isValid) return;
      
      // Try API registration first
      if (typeof window !== 'undefined' && window.apiClient) {
        try {
          const response = await window.apiClient.register({
            name,
            email,
            password,
            phone: phone || null,
            address: address || null
          });
          
          if (response.token && response.user) {
            const user = response.user;
            const userRoles = user.roles || [];
            const userRole = userRoles.includes('admin') ? 'admin' : 'user';
            
            // Save user session
            localStorage.setItem('userRole', userRole);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.name);
            localStorage.setItem('isLoggedIn', 'true');
            
            if (user.phone) {
              localStorage.setItem('userPhone', user.phone);
            }
            if (user.address) {
              localStorage.setItem('userAddress', user.address);
            }
            
            console.log('Registration successful via API');
            closeRegisterModal();
            
            // Reload header to show user info
            if (typeof loadHeader === 'function') {
              loadHeader();
            }
            
            // Redirect to home page
            setTimeout(() => {
              window.location.href = `${getBasePath()}index.html`;
            }, 300);
            return;
          }
        } catch (error) {
          console.error('API registration error:', error);
          if (emailError) {
            emailError.textContent = error.message || 'Registration failed. Please try again.';
          }
          return;
        }
      }
      
      // Fallback to localStorage registration
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = registeredUsers.find(u => u.email === email);
      
      if (existingUser) {
        if (emailError) {
          emailError.textContent = 'This email is already registered';
        }
        return;
      }
      
      const newUser = {
        email,
        name,
        password, // In real app, this should be hashed
        phone: phone || null,
        address: address || null,
        role: 'user',
        registeredDate: new Date().toISOString()
      };
      
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      // Auto-login after registration
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('isLoggedIn', 'true');
      if (phone) localStorage.setItem('userPhone', phone);
      if (address) localStorage.setItem('userAddress', address);
      
      console.log('Registration successful via localStorage');
      closeRegisterModal();
      
      // Reload header to show user info
      if (typeof loadHeader === 'function') {
        loadHeader();
      }
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = `${getBasePath()}index.html`;
      }, 300);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
  loadOfferBanner();
  loadLoginModal();
  loadRegisterModal();
  updateCartCounter();
  
  setTimeout(() => {
    initBurgerMenu();
    initLoginModal();
  }, 100);
});
