// Catalog page functionality

const PRODUCTS_PER_PAGE = 12;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;

// Data loading
async function loadProducts() {
  try {
    const basePath = getBasePath();
    const jsonPath = `${basePath}assets/data.json`;
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    return [];
  }
}

function getProductImageUrl(product, basePathOverride = null) {
  const basePath = basePathOverride || getBasePath();
  
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

// Rendering
function renderProductCard(product) {
  const basePath = getBasePath();
  const hasSale = product.salesStatus;
  const imageUrl = getProductImageUrl(product);
  
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

// Filtering and sorting
function parseSizeString(sizeString) {
  if (sizeString.includes(',')) {
    return sizeString.split(',').map(s => s.trim());
  }
  if (sizeString.includes('-')) {
    const [start, end] = sizeString.split('-');
    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const startIndex = sizeOrder.indexOf(start);
    const endIndex = sizeOrder.indexOf(end);
    if (startIndex !== -1 && endIndex !== -1) {
      return sizeOrder.slice(startIndex, endIndex + 1);
    }
  }
  return [sizeString];
}

function matchesSizeFilter(productSize, selectedSize) {
  if (productSize === selectedSize) {
    return true;
  }
  
  if (selectedSize === 'S-L') {
    const productSizes = parseSizeString(productSize);
    return productSizes.some(size => ['S', 'M', 'L'].includes(size));
  }
  
  if (selectedSize === 'S, M, XL') {
    const selectedSizes = ['S', 'M', 'XL'];
    const productSizes = parseSizeString(productSize);
    return selectedSizes.every(size => productSizes.includes(size));
  }
  
  if (productSize.includes(',')) {
    const productSizes = parseSizeString(productSize);
    return productSizes.includes(selectedSize);
  }
  
  if (productSize.includes('-') && productSize !== selectedSize) {
    const productSizes = parseSizeString(productSize);
    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const selectedIndex = sizeOrder.indexOf(selectedSize);
    return selectedIndex !== -1 && productSizes.includes(selectedSize);
  }
  
  return false;
}

function applyFilters() {
  filteredProducts = [...allProducts];
  
  const categorySelect = document.getElementById('filter-category');
  const colorSelect = document.getElementById('filter-color');
  const sizeSelect = document.getElementById('filter-size');
  
  const selectedCategory = categorySelect?.value || '';
  const selectedColor = colorSelect?.value || '';
  const selectedSize = sizeSelect?.value || '';
  
  if (categorySelect) {
    categorySelect.classList.toggle('catalog__filter-select--active', selectedCategory !== '');
  }
  if (colorSelect) {
    colorSelect.classList.toggle('catalog__filter-select--active', selectedColor !== '');
  }
  if (sizeSelect) {
    sizeSelect.classList.toggle('catalog__filter-select--active', selectedSize !== '');
  }
  
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === selectedCategory
    );
  }
  
  if (selectedColor) {
    filteredProducts = filteredProducts.filter(product => 
      product.color === selectedColor
    );
  }
  
  if (selectedSize) {
    filteredProducts = filteredProducts.filter(product => matchesSizeFilter(product.size, selectedSize));
  }
  
  const onSaleCheckbox = document.querySelector('input[name="salesStatus"]:checked');
  if (onSaleCheckbox) {
    filteredProducts = filteredProducts.filter(product => product.salesStatus === true);
  }
  
  const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
  }
  
  applySorting();
  currentPage = 1;
  renderProducts();
  renderPagination();
  updateResultsCount();
}

function applySorting() {
  const sortValue = document.getElementById('sort-select').value;
  
  switch (sortValue) {
    case 'price-low':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
      filteredProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      break;
    case 'rating':
      filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break;
  }
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);
  
  if (pageProducts.length === 0) {
    grid.innerHTML = '<p class="catalog__no-results">No products found</p>';
    return;
  }
  
  grid.innerHTML = pageProducts.map(product => renderProductCard(product)).join('');
  
  grid.querySelectorAll('.product-card__btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = e.target.getAttribute('data-product-id');
      const originalText = btn.textContent;
      await addToCart(productId);
      btn.textContent = 'Added';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  });
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;
  
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  const basePath = getBasePath();
  const prevDisabled = currentPage === 1;
  paginationHTML += `<button class="catalog__pagination-btn catalog__pagination-btn--nav ${prevDisabled ? 'catalog__pagination-btn--disabled' : ''}" data-page="${currentPage - 1}" ${prevDisabled ? 'disabled' : ''}>
        <img src="${basePath}assets/images/icons/arrow-right.svg" alt="" class="catalog__pagination-arrow catalog__pagination-arrow--prev">
    <span>PREV</span>
  </button>`;
  
  paginationHTML += '<div class="catalog__pagination-numbers">';
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="catalog__pagination-btn catalog__pagination-btn--active" data-page="${i}">${i}</button>`;
    } else {
      paginationHTML += `<button class="catalog__pagination-btn" data-page="${i}">${i}</button>`;
    }
  }
  paginationHTML += '</div>';
  
  const nextDisabled = currentPage === totalPages;
  paginationHTML += `<button class="catalog__pagination-btn catalog__pagination-btn--nav ${nextDisabled ? 'catalog__pagination-btn--disabled' : ''}" data-page="${currentPage + 1}" ${nextDisabled ? 'disabled' : ''}>
    <span>NEXT</span>
        <img src="${basePath}assets/images/icons/arrow-right.svg" alt="" class="catalog__pagination-arrow catalog__pagination-arrow--next">
  </button>`;
  
  pagination.innerHTML = paginationHTML;
  
  pagination.querySelectorAll('.catalog__pagination-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const button = e.target.closest('.catalog__pagination-btn');
      if (!button || button.disabled) return;
      
      const page = parseInt(button.getAttribute('data-page'));
      if (!isNaN(page) && page > 0) {
        goToPage(page);
      }
    });
  });
}

// Go to specific page
function goToPage(page) {
  currentPage = page;
  renderProducts();
  renderPagination();
  updateResultsCount();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateResultsCount() {
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE + 1;
  const end = Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length);
  const total = filteredProducts.length;
  
  document.getElementById('results-start').textContent = start;
  document.getElementById('results-end').textContent = end;
  document.getElementById('results-total').textContent = total;
}

function loadTopSets() {
  const setsContainer = document.getElementById('top-sets');
  const setsContainerTop = document.getElementById('top-sets-top');
  
  const sets = allProducts.filter(product => product.category === 'luggage sets');
  const setsCopy = [...sets];
  setsCopy.sort(() => 0.5 - Math.random());
  const shuffled = setsCopy;
  const randomSets = shuffled.slice(0, 5);
  
  if (randomSets.length === 0) {
    if (setsContainer) setsContainer.innerHTML = '<p>No sets available</p>';
    if (setsContainerTop) setsContainerTop.innerHTML = '<p>No sets available</p>';
    return;
  }
  
  const basePath = getBasePath();
  const setsHTML = randomSets.map(set => {
    const imageUrl = getProductImageUrl(set, basePath);
    const rating = Math.round(set.rating || 0);
    const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
    const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
    
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < rating;
      const starPath = isFilled ? yellowStarPath : greyStarPath;
      return `<img src="${starPath}" alt="star" class="catalog__star">`;
    }).join('');
    
    return `
      <article class="catalog__set-card">
        <a href="${basePath}html/product-card.html?id=${set.id}" class="catalog__set-link">
          <img src="${imageUrl}" alt="${set.name}" class="catalog__set-image">
          <div class="catalog__set-content">
            <p class="catalog__set-name">${set.name}</p>
            <div class="catalog__set-rating">${starsHTML}</div>
            <p class="catalog__set-price">$${set.price}</p>
          </div>
        </a>
      </article>
    `;
  }).join('');
  
  if (setsContainer) setsContainer.innerHTML = setsHTML;
  if (setsContainerTop) setsContainerTop.innerHTML = setsHTML;
}

function showFiltersPanel() {
  const panel = document.getElementById('filters-panel');
  if (panel) {
    panel.style.display = 'block';
  }
}

function hideFiltersPanelOnBlur() {
  const panel = document.getElementById('filters-panel');
  const filtersBtn = document.getElementById('filters-toggle');
  if (panel && filtersBtn) {
    setTimeout(() => {
      const isHoveringButton = filtersBtn.matches(':hover');
      const isHoveringPanel = panel.matches(':hover');
      if (!isHoveringButton && !isHoveringPanel) {
        panel.style.display = 'none';
      }
    }, 100);
  }
}

function hideFiltersPanel() {
  const panel = document.getElementById('filters-panel');
  if (panel) {
    panel.style.display = 'none';
  }
}

function resetFilters() {
  const categorySelect = document.getElementById('filter-category');
  const colorSelect = document.getElementById('filter-color');
  const sizeSelect = document.getElementById('filter-size');
  
  if (categorySelect) {
    categorySelect.value = '';
    categorySelect.classList.remove('catalog__filter-select--active');
  }
  if (colorSelect) {
    colorSelect.value = '';
    colorSelect.classList.remove('catalog__filter-select--active');
  }
  if (sizeSelect) {
    sizeSelect.value = '';
    sizeSelect.classList.remove('catalog__filter-select--active');
  }
  
  const salesCheckbox = document.querySelector('input[name="salesStatus"]');
  if (salesCheckbox) {
    salesCheckbox.checked = false;
  }
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value = 'default';
  applyFilters();
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput?.value.toLowerCase().trim();
  
  if (!searchTerm) {
    applyFilters();
    return;
  }
  
  let matchingProducts = [...allProducts];
  
  const categoryFilter = document.getElementById('filter-category').value;
  if (categoryFilter) {
    matchingProducts = matchingProducts.filter(product => product.category === categoryFilter);
  }
  
  const colorFilter = document.getElementById('filter-color').value;
  if (colorFilter) {
    matchingProducts = matchingProducts.filter(product => product.color === colorFilter);
  }
  
  const sizeFilter = document.getElementById('filter-size').value;
  if (sizeFilter) {
    if (sizeFilter === 'S-L') {
      matchingProducts = matchingProducts.filter(product => {
        const sizes = product.size || [];
        return sizes.some(s => ['S', 'M', 'L'].includes(s));
      });
    } else if (sizeFilter === 'S, M, XL') {
      matchingProducts = matchingProducts.filter(product => {
        const sizes = product.size || [];
        return ['S', 'M', 'XL'].every(s => sizes.includes(s));
      });
    } else {
      matchingProducts = matchingProducts.filter(product => {
        const sizes = product.size || [];
        return sizes.includes(sizeFilter);
      });
    }
  }
  
  const salesCheckbox = document.querySelector('input[name="salesStatus"]:checked');
  if (salesCheckbox) {
    matchingProducts = matchingProducts.filter(product => product.sale);
  }
  
  if (searchTerm) {
    matchingProducts = matchingProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm)
    );
  }
  
  if (matchingProducts.length === 0) {
    alert('Product not found');
    searchInput.value = '';
    applyFilters();
  } else if (matchingProducts.length === 1) {
    const basePath = getBasePath();
    window.location.href = `${basePath}html/product-card.html?id=${matchingProducts[0].id}`;
  } else {
    applyFilters();
  }
}

// Cart actions
async function addToCart(productId) {
  if (!productId) {
    return;
  }
  
  const basePath = getBasePath();
  const jsonPath = `${basePath}assets/data.json`;
  const response = await fetch(jsonPath);
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  const product = data.data.find(item => item.id === productId);
  
  if (!product) {
    return;
  }
  
  const imageUrl = getProductImageUrl(product, basePath);
  
  addItemToCart(productId, 1, {
    name: product.name,
    price: product.price,
    image: imageUrl,
    size: '',
    color: product.color || ''
  });
}

async function initCatalog() {
  allProducts = await loadProducts();
  
  if (allProducts.length === 0) {
    return;
  }
  
  filteredProducts = [...allProducts];
  
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFilter = urlParams.get('category');
  if (categoryFilter) {
    const categorySelect = document.getElementById('filter-category');
    if (categorySelect) {
      categorySelect.value = categoryFilter;
    }
  }
  
  if (categoryFilter) {
    applyFilters();
  } else {
    renderProducts();
    renderPagination();
    updateResultsCount();
  }
  
  loadTopSets();
  
  const filtersBtn = document.getElementById('filters-toggle');
  const filtersPanel = document.getElementById('filters-panel');
  
  if (filtersBtn && filtersPanel) {
    filtersBtn.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        e.stopPropagation();
        if (filtersPanel.style.display === 'none' || !filtersPanel.style.display) {
          showFiltersPanel();
        } else {
          hideFiltersPanel();
        }
      }
    });
    
    filtersBtn.addEventListener('mouseenter', () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        showFiltersPanel();
      }
    });
    
    filtersPanel.addEventListener('mouseleave', () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        hideFiltersPanelOnBlur();
      }
    });
    
    filtersBtn.addEventListener('mouseleave', () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        hideFiltersPanelOnBlur();
      }
    });
    
    // Close panel when clicking outside on mobile
    document.addEventListener('click', (e) => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && filtersPanel.style.display !== 'none' && filtersPanel.style.display) {
        if (!filtersPanel.contains(e.target) && !filtersBtn.contains(e.target)) {
          hideFiltersPanel();
        }
      }
    });
  }
  
  document.getElementById('hide-filters')?.addEventListener('click', hideFiltersPanel);
  document.getElementById('clear-filters')?.addEventListener('click', resetFilters);
  
  // Open select dropdown on hover (desktop) or click (mobile)
  const isMobile = window.innerWidth <= 768;
  
  document.querySelectorAll('.catalog__filter-select-wrapper').forEach(wrapper => {
    const select = wrapper.querySelector('.catalog__filter-select');
    if (select) {
      if (isMobile) {
        // On mobile: open on click
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation();
          select.focus();
          select.click();
        });
      } else {
        // On desktop: open on hover
        let hoverTimeout;
        wrapper.addEventListener('mouseenter', () => {
          hoverTimeout = setTimeout(() => {
            select.focus();
            const event = new MouseEvent('mousedown', {
              view: window,
              bubbles: true,
              cancelable: true,
              buttons: 1
            });
            select.dispatchEvent(event);
          }, 100);
        });
        
        wrapper.addEventListener('mouseleave', () => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
          }
        });
      }
    }
  });
  
  document.getElementById('filter-category')?.addEventListener('change', applyFilters);
  document.getElementById('filter-color')?.addEventListener('change', applyFilters);
  document.getElementById('filter-size')?.addEventListener('change', applyFilters);
  document.querySelector('input[name="salesStatus"]')?.addEventListener('change', applyFilters);
  
  document.getElementById('sort-select').addEventListener('change', applyFilters);
  
  const searchInput = document.getElementById('search-input');
  const searchIcon = document.querySelector('.catalog__search-icon');
  
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearch();
      }
    });
  }
  
  if (searchIcon) {
    searchIcon.addEventListener('click', (e) => {
      e.preventDefault();
      handleSearch();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}

