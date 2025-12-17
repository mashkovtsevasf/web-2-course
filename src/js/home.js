// Homepage functionality

// Use global functions from main.js
// getBasePath and getCurrentPage are defined in main.js and available globally

async function loadProducts() {
  try {
    const basePath = window.getBasePath ? window.getBasePath() : (() => {
      const path = window.location.pathname;
      const isSubPage = path.includes('/html/');
      return isSubPage ? '/src/' : '/src/';
    })();
    const jsonPath = `${basePath}assets/data.json`;
    const response = await fetch(jsonPath);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const jsonProducts = data.data || [];
    
    // Load admin-added products from localStorage
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    
    // Load deleted product IDs
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    
    // Merge: admin products override JSON products with same ID, new ones are added
    const productsMap = new Map();
    
    // First, add all JSON products (except deleted ones)
    jsonProducts.forEach(product => {
      if (!deletedProducts.includes(product.id)) {
        productsMap.set(product.id, product);
      }
    });
    
    // Then, add/override with admin products (admin products have priority)
    adminProducts.forEach(product => {
      productsMap.set(product.id, product);
    });
    
    // Convert to array
    return Array.from(productsMap.values());
  } catch (error) {
    // Fallback to localStorage only
    return JSON.parse(localStorage.getItem('adminProducts') || '[]');
  }
}

// Get products by block name
function getProductsByBlock(products, blockName) {
  return products.filter(product => product?.blocks?.includes(blockName));
}

function getProductImageUrl(product, basePathOverride = null) {
  const basePath = basePathOverride || (window.getBasePath ? window.getBasePath() : (() => {
    const path = window.location.pathname;
    const isSubPage = path.includes('/html/');
    return isSubPage ? '/src/' : '/src/';
  })());
  
  // Check if imageUrl is a base64 string (from admin-uploaded images)
  if (product.imageUrl && product.imageUrl.startsWith('data:image/')) {
    return product.imageUrl;
  }
  
  if (product.category === 'luggage sets') {
    const setColorMap = {
      'red': `${basePath}assets/images/suitcases/set-of-suitcase-red-small.png`,
      'blue': `${basePath}assets/images/suitcases/set-of-suitcase-blue-small.png`,
      'green': `${basePath}assets/images/suitcases/set-of-suitcase-green-small.png`,
      'black': `${basePath}assets/images/suitcases/set-of-suitcase-black-small.png`,
      'yellow': `${basePath}assets/images/suitcases/set-of-suitcase-yellow-small.png`
    };
    
    if (setColorMap[product.color]) {
      return setColorMap[product.color];
    }
  }
  
  if (product.imageUrl && !product.imageUrl.includes('path/to/')) {
    if (product.imageUrl.startsWith('assets/')) {
      return `${basePath}${product.imageUrl}`;
    }
    return product.imageUrl;
  }
  
  const colorMap = {
    'red': `${basePath}assets/images/suitcases/selected-suitcase-red-card.png`,
    'blue': `${basePath}assets/images/suitcases/selected-suitcase-blue-card.png`,
    'pink': `${basePath}assets/images/suitcases/selected-suitcase-pink-card.png`,
    'beige': `${basePath}assets/images/suitcases/selected-suitcase-beige-card.png`,
    'yellow': `${basePath}assets/images/suitcases/new-suitcase-yellow-card.png`,
    'grey': `${basePath}assets/images/suitcases/new-suitcase-handgrey-card.png`,
    'darkblue': `${basePath}assets/images/suitcases/new-suitcase-darkblue-card.png`
  };
  
  return colorMap[product.color] || `${basePath}assets/images/suitcases/selected-suitcase-red-card.png`;
}

function renderProductCard(product) {
  const basePath = window.getBasePath ? window.getBasePath() : (() => {
    const path = window.location.pathname;
    const isSubPage = path.includes('/html/');
    return isSubPage ? '/src/' : '/src/';
  })();
  const hasSale = product.salesStatus;
  const imageUrl = getProductImageUrl(product, basePath);
  
  return `
    <article class="product-card">
      <div class="product-card__image-wrapper">
        <a href="${basePath}html/product-card.html?id=${product.id}">
          <img src="${imageUrl}" alt="${product.name}" class="product-card__image">
        </a>
        ${hasSale ? '<span class="product-card__tag">SALE</span>' : ''}
      </div>
      <div class="product-card__content">
        <h3 class="product-card__name">${product.name}</h3>
        <p class="product-card__price">$${product.price}</p>
        <button class="btn btn--primary product-card__btn" data-product-id="${product.id}">Add To Cart</button>
      </div>
    </article>
  `;
}

function renderProductsToGrid(grid, productsToShow) {
  if (!grid) return;
  grid.innerHTML = productsToShow
    .map(product => renderProductCard(product))
    .join('');
  attachAddToCartListeners();
}

function renderProductsToContainer(productsToShow, grid, slider, prefix) {
  const isDesktop = window.innerWidth > 1440;
  
  if (isDesktop && grid) {
    renderProductsToGrid(grid, productsToShow);
  } else if (slider) {
    const sliderInstance = new ProductsSlider(slider, productsToShow, prefix);
    if (sliderInstance) {
      // Slider initialized in constructor
    }
  } else if (grid) {
    renderProductsToGrid(grid, productsToShow);
  }
}

function showErrorOrEmpty(grid, slider, isEmpty) {
  const message = isEmpty ? '<p>No products available</p>' : '<p>Error loading products.</p>';
  if (grid) grid.innerHTML = message;
  if (slider) slider.innerHTML = message;
}

function prepareProductsToShow(filteredProducts, allProducts, isDesktop) {
  const sourceProducts = filteredProducts.length > 0 ? filteredProducts : allProducts;
  if (isDesktop) {
    return sourceProducts;
  }
  return sourceProducts.slice(0, 4);
}

async function loadSelectedProducts() {
  console.log('loadSelectedProducts called');
  const grid = document.querySelector('.selected-products__grid');
  const slider = document.querySelector('.selected-products__slider');
  
  if (!grid) {
    console.error('Selected products grid not found');
    return;
  }
  
  try {
    const products = await loadProducts();
    console.log('Loaded products:', products.length);
    
    if (products.length === 0) {
      console.log('No products found');
      showErrorOrEmpty(grid, slider, false);
      return;
    }
    
    const selectedProducts = getProductsByBlock(products, 'Selected Products');
    console.log('Selected products found:', selectedProducts.length);
    
    const isDesktop = window.innerWidth > 1440;
    const productsToShow = prepareProductsToShow(selectedProducts, products, isDesktop);
    console.log('Products to show:', productsToShow.length);
    
    if (productsToShow.length === 0) {
      console.log('No products to show after filtering');
      showErrorOrEmpty(grid, slider, true);
      return;
    }
    
    renderProductsToContainer(productsToShow, grid, slider, 'selected-products');
  } catch (error) {
    console.error('Error loading selected products:', error);
    showErrorOrEmpty(grid, slider, false);
  }
}

async function loadNewProducts() {
  console.log('loadNewProducts called');
  const grid = document.querySelector('.new-products__grid');
  const slider = document.querySelector('.new-products__slider');
  
  if (!grid) {
    console.error('New products grid not found');
    return;
  }
  
  try {
    const products = await loadProducts();
    console.log('Loaded products for new:', products.length);
    
    if (products.length === 0) {
      console.log('No products found for new');
      showErrorOrEmpty(grid, slider, false);
      return;
    }
    
    const newProducts = getProductsByBlock(products, 'New Products Arrival');
    console.log('New products found:', newProducts.length);
    
    const isDesktop = window.innerWidth > 1440;
    const productsToShow = prepareProductsToShow(newProducts, products, isDesktop);
    console.log('New products to show:', productsToShow.length);
    
    if (productsToShow.length === 0) {
      console.log('No new products to show after filtering');
      showErrorOrEmpty(grid, slider, true);
      return;
    }
    
    renderProductsToContainer(productsToShow, grid, slider, 'new-products');
  } catch (error) {
    console.error('Error loading new products:', error);
    showErrorOrEmpty(grid, slider, false);
  }
}

// Sliders
class ProductsSlider {
  constructor(container, products, prefix) {
    this.container = container;
    this.products = products;
    this.prefix = prefix;
    this.currentIndex = 0;
    this.init();
  }

  init() {
    if (!this.container) return;
    
    if (this.products.length === 0) {
      this.container.innerHTML = '';
      return;
    }
    
    const allProducts = [...this.products, ...this.products, ...this.products];
    this.currentIndex = this.products.length;
    
    this.container.innerHTML = `
      <div class="${this.prefix}__slider-wrapper">
        <button class="slider-arrow slider-arrow--left" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="${this.prefix}__slider-container">
          <div class="${this.prefix}__slider-track">
            ${allProducts.map((product) => renderProductCard(product)).join('')}
          </div>
        </div>
        <button class="slider-arrow slider-arrow--right" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    this.attachEventListeners();
    this.updateSlider();
    this.attachAddToCartListeners();
  }

  attachEventListeners() {
    const prevButton = this.container.querySelector('.slider-arrow--left');
    const nextButton = this.container.querySelector('.slider-arrow--right');

    if (prevButton) {
      prevButton.addEventListener('click', () => this.prevSlide());
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => this.nextSlide());
    }
  }

  attachAddToCartListeners() {
    this.container.querySelectorAll('.product-card__btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.getAttribute('data-product-id');
        if (productId) {
          const originalText = btn.textContent;
          await addToCart(productId);
          btn.textContent = 'Added';
          setTimeout(() => {
            btn.textContent = originalText;
          }, 2000);
        }
      });
    });
  }

  prevSlide() {
    this.currentIndex--;
    this.updateSlider();
    
    const track = this.container.querySelector(`.${this.prefix}__slider-track`);
    if (this.currentIndex < this.products.length && track) {
      setTimeout(() => {
        this.currentIndex = this.products.length * 2;
        track.style.transition = 'none';
        this.updateSlider();
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease';
        }, 50);
      }, 500);
    }
  }

  nextSlide() {
    this.currentIndex++;
    this.updateSlider();
    
    const track = this.container.querySelector(`.${this.prefix}__slider-track`);
    if (this.currentIndex >= this.products.length * 2 && track) {
      setTimeout(() => {
        this.currentIndex = this.products.length;
        track.style.transition = 'none';
        this.updateSlider();
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease';
        }, 50);
      }, 500);
    }
  }

  updateSlider() {
    const track = this.container.querySelector(`.${this.prefix}__slider-track`);
    if (track) {
      const cardWidth = 296;
      const gap = window.innerWidth <= 768 ? 15 : 51;
      const translateX = -(this.currentIndex * (cardWidth + gap));
      track.style.transform = `translateX(${translateX}px)`;
      if (!track.style.transition) {
        track.style.transition = 'transform 0.5s ease';
      }
    }
  }
}

class TravelSuitcasesSlider {
  constructor() {
    this.currentIndex = 0;
    this.images = [
      '/src/assets/images/suitcases/travel-suitcase-real-1.png',
      '/src/assets/images/suitcases/travel-suitcase-real-2.png',
      '/src/assets/images/suitcases/travel-suitcase-real-3.png',
      '/src/assets/images/suitcases/travel-suitcase-real-4.png'
    ];
    this.texts = [
      'Duis vestibulum elit vel neque.',
      'Neque vestibulum elit nequvel.',
      'Elituis stibulum elit velneque.',
      'Vel vestibulum elit tuvel euqen.',
      'Quisque scelerisque nisi urna.',
      'Pharetra vulputate scelerisque nisi.',
      'Vestibulum elit vel neque pharetra.',
      'Duis rutrum non risus in imperdiet.'
    ];
    
    const textsCopy = [...this.texts];
    textsCopy.sort(() => Math.random() - 0.5);
    this.texts = textsCopy;
    this.init();
  }

  init() {
    const sliderContainer = document.querySelector('.travel-suitcases__slider');
    if (!sliderContainer) {
      setTimeout(() => this.init(), 100);
      return;
    }

    const allImages = [...this.images, ...this.images, ...this.images];
    const allTexts = [...this.texts, ...this.texts, ...this.texts];
    
    this.currentIndex = this.images.length;
    
    sliderContainer.innerHTML = `
      <div class="travel-suitcases__slider-wrapper">
        <button class="slider-arrow slider-arrow--left" aria-label="Previous image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="travel-suitcases__slider-container">
          <div class="travel-suitcases__slider-track">
            ${allImages.map((img, index) => `
              <div class="travel-suitcase-card" data-index="${index % this.images.length}">
                <div class="travel-suitcase-card__image" style="background-image: url('${img}');">
                </div>
                <div class="travel-suitcase-card__content">
                  <h3 class="travel-suitcase-card__title">${allTexts[index]}</h3>
                  <p class="travel-suitcase-card__text">Duis vestibulum vel neque pharetra vulputate. Quisque scelerisque nisi.</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <button class="slider-arrow slider-arrow--right" aria-label="Next image">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;

    this.attachEventListeners();
    this.updateSlider();
  }

  attachEventListeners() {
    const prevButton = document.querySelector('.slider-arrow--left');
    const nextButton = document.querySelector('.slider-arrow--right');

    if (prevButton) {
      prevButton.addEventListener('click', () => {
        this.prevSlide();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        this.nextSlide();
      });
    }
  }

  prevSlide() {
    this.currentIndex--;
    this.updateSlider();
    
    const track = document.querySelector('.travel-suitcases__slider-track');
    if (this.currentIndex < this.images.length && track) {
      setTimeout(() => {
        this.currentIndex = this.images.length * 2;
        track.style.transition = 'none';
        this.updateSlider();
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease';
        }, 50);
      }, 500);
    }
  }

  nextSlide() {
    this.currentIndex++;
    this.updateSlider();
    
    const track = document.querySelector('.travel-suitcases__slider-track');
    if (this.currentIndex >= this.images.length * 2 && track) {
      setTimeout(() => {
        this.currentIndex = this.images.length;
        track.style.transition = 'none';
        this.updateSlider();
        setTimeout(() => {
          track.style.transition = 'transform 0.5s ease';
        }, 50);
      }, 500);
    }
  }

  updateSlider() {
    const track = document.querySelector('.travel-suitcases__slider-track');
    if (track) {
      const cardWidth = 296;
      const gap = 24;
      const translateX = -(this.currentIndex * (cardWidth + gap));
      track.style.transform = `translateX(${translateX}px)`;
      if (!track.style.transition) {
        track.style.transition = 'transform 0.5s ease';
      }
    }
  }
}

// Cart actions
async function addToCart(productId) {
  if (!productId) {
    return;
  }
  
  // Try to find in localStorage first (admin products)
  const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
  let product = adminProducts.find(p => p.id === productId);
  
  // If not found, try to load from JSON
  if (!product) {
    try {
      const basePath = window.getBasePath ? window.getBasePath() : (() => {
    const path = window.location.pathname;
    const isSubPage = path.includes('/html/');
    return isSubPage ? '/src/' : '/src/';
  })();
      const jsonPath = `${basePath}assets/data.json`;
      const response = await fetch(jsonPath);
      if (response.ok) {
        const data = await response.json();
        product = data.data.find(item => item.id === productId);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    }
  }
  
  if (!product) {
    return;
  }
  
  const basePath = window.getBasePath ? window.getBasePath() : (() => {
    const path = window.location.pathname;
    const isSubPage = path.includes('/html/');
    return isSubPage ? '/src/' : '/src/';
  })();
  const imageUrl = getProductImageUrl(product, basePath);
  
  const added = addItemToCart(productId, 1, {
    name: product.name,
    price: product.price,
    image: imageUrl,
    size: '',
    color: product.color || ''
  });
  
  if (added && typeof updateCartCounter === 'function') {
    updateCartCounter();
  }
}

function attachAddToCartListeners() {
  if (window.addToCartHandler) {
    document.removeEventListener('click', window.addToCartHandler);
  }
  
  window.addToCartHandler = async (e) => {
    const btn = e.target.closest('.product-card__btn');
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.getAttribute('data-product-id');
      if (productId) {
        const originalText = btn.textContent;
        await addToCart(productId);
        btn.textContent = 'Added';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    }
  };
  
  document.addEventListener('click', window.addToCartHandler);
}

let resizeTimeout;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const currentPage = window.getCurrentPage ? window.getCurrentPage() : 'home';
    if (currentPage === 'home') {
      loadSelectedProducts().then(() => {
        attachAddToCartListeners();
      });
      loadNewProducts().then(() => {
        attachAddToCartListeners();
      });
    }
  }, 250);
}

function initHomePage() {
  const currentPage = window.getCurrentPage ? window.getCurrentPage() : (() => {
    const path = window.location.pathname;
    if (path.includes('catalog.html')) return 'catalog';
    if (path.includes('about.html')) return 'about';
    if (path.includes('contact.html')) return 'contact';
    if (path.includes('cart.html')) return 'cart';
    if (path.includes('product')) return 'product';
    if (path.includes('profile.html')) return 'profile';
    if (path.includes('admin.html') || path.includes('admin-products.html')) return 'admin';
    return 'home';
  })();
  
  console.log('initHomePage called, current page:', currentPage);
  if (currentPage !== 'home') {
    console.log('Not home page, skipping');
    return;
  }
  
  const checkAndLoad = () => {
    const selectedSection = document.querySelector('.selected-products');
    const newSection = document.querySelector('.new-products');
    
    console.log('Checking sections:', { selectedSection, newSection });
    
    if (!selectedSection || !newSection) {
      console.log('Sections not found, retrying...');
      setTimeout(checkAndLoad, 100);
      return;
    }
    
    console.log('Sections found, loading products...');
    loadSelectedProducts().then(() => {
      attachAddToCartListeners();
    });
    loadNewProducts().then(() => {
      attachAddToCartListeners();
    });
    
    setTimeout(() => {
      const sliderInstance = new TravelSuitcasesSlider();
      if (sliderInstance) {
        // Slider initialized in constructor
      }
    }, 100);
    
    setTimeout(() => {
      attachAddToCartListeners();
    }, 500);
  };
  
  checkAndLoad();
}

document.addEventListener('DOMContentLoaded', () => {
  initHomePage();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}

window.addEventListener('resize', handleResize);

