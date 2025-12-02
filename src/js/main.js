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
              <button class="header__icon-btn" id="account-btn" aria-label="Account">
                <img src="${basePath}assets/images/homepage/user.svg" alt="Account">
              </button>
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
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
  } catch (error) {
  }
}

function addItemToCart(productId, quantity, productData) {
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
  
  saveCartToStorage(cart);
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
  
  if (!accountBtn || !loginModal) return;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  accountBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
  
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
  
  // Form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const isEmailValid = validateEmail();
      const isPasswordValid = validatePassword();
      
      if (isEmailValid && isPasswordValid) {
        setTimeout(() => {
          closeLoginModal();
        }, 300);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
  loadOfferBanner();
  loadLoginModal();
  updateCartCounter();
  
  setTimeout(() => {
    initBurgerMenu();
    initLoginModal();
  }, 100);
});
