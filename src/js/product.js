// Product Details Page functionality

function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

async function loadProduct() {
  try {
    const productId = getProductIdFromURL();
    if (!productId) {
      return null;
    }

    const basePath = getBasePath();
    const jsonPath = `${basePath}assets/data.json`;
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const product = data.data.find(item => item.id === productId);
    return product;
  } catch (error) {
    return null;
  }
}

// Data loading
function getProductImageUrl(product) {
  if (!product) return '';
  
  const basePath = getBasePath();
  
  if (product.imageUrl && !product.imageUrl.includes('placeholder')) {
    return `${basePath}${product.imageUrl}`;
  }
  
  const colorMap = {
    'red': 'selected-suitcase-red-card.png',
    'blue': 'selected-suitcase-blue-card.png',
    'green': 'selected-suitcase-green-card.png',
    'black': 'selected-suitcase-black-card.png',
    'grey': 'selected-suitcase-grey-card.png',
    'yellow': 'new-suitcase-yellow-card.png',
    'pink': 'selected-suitcase-pink-card.png',
    'beige': 'selected-suitcase-beige-card.png'
  };
  
  const imageName = colorMap[product.color] || 'selected-suitcase-red-card.png';
  return `${basePath}assets/images/suitcases/${imageName}`;
}

// Rendering
function renderProductDetails(product) {
  if (!product) {
    return;
  }
  
  const mainImage = document.getElementById('product-main-image');
  if (mainImage) {
    const imageUrl = getProductImageUrl(product);
    mainImage.src = imageUrl;
    mainImage.alt = product.name;
  }

  const title = document.getElementById('product-title');
  if (title) {
    title.textContent = product.name;
  }

  const price = document.getElementById('product-price');
  if (price) {
    price.textContent = `$${product.price}`;
  }

  const productRating = document.getElementById('product-rating');
  if (productRating && product.rating) {
    const basePath = getBasePath();
    const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
    const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
    const roundedRating = Math.round(product.rating);
    
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < roundedRating;
      const starPath = isFilled ? yellowStarPath : greyStarPath;
      return `<img src="${starPath}" alt="star" class="product-details__star">`;
    }).join('');
    
    productRating.innerHTML = starsHTML;
  }
  
  window.currentProduct = product;

  const reviewsCount = document.getElementById('product-reviews-count');
  if (reviewsCount) {
    let count = product.reviewsCount || product.reviews || 0;
    
    if (count === 0) {
      const reviewItems = document.querySelectorAll('.product-details__review-item:not(.product-details__review-item--hardcoded)');
      count = reviewItems.length;
    }
    
    if (count === 1) {
      reviewsCount.textContent = `(${count} Client Review)`;
    } else {
      reviewsCount.textContent = `(${count} Clients Reviews)`;
    }
  }

  const description = document.getElementById('product-description');
  if (description) {
    description.innerHTML = `
      <p>The new Global Explorer Max Comfort Suitcase Pro is a bold reimagining of travel essentials, designed to elevate every journey. Made with at least 30% recycled materials, its lightweight yet impact-resistant shell combines eco-conscious innovation with rugged durability.</p>
      <p>The ergonomic handle and GlideMotion spinner wheels ensure effortless mobility while making a statement in sleek design. Inside, the modular compartments and adjustable straps keep your belongings secure and neatly organized, no matter the destination.</p>
    `;
  }

  const thumbnails = document.getElementById('product-thumbnails');
  if (thumbnails) {
    const imageUrl = getProductImageUrl(product);
    thumbnails.innerHTML = Array.from({ length: 4 }, (_, i) => {
      return `<div class="product-details__thumbnail">
        <img src="${imageUrl}" alt="Product thumbnail ${i + 1}">
      </div>`;
    }).join('');
  }

  populateOptions(product);
  renderReviewRating(4);
  renderReviewStarsInput();
  loadSavedReviews(product.id);
  updateReviewsHeading(product);
}

function renderReviewRating(rating) {
  const reviewRatingDisplay = document.getElementById('review-rating-display');
  if (reviewRatingDisplay) {
    const basePath = getBasePath();
    const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
    const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
    const roundedRating = Math.round(rating);
    
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < roundedRating;
      const starPath = isFilled ? yellowStarPath : greyStarPath;
      return `<img src="${starPath}" alt="star" class="product-details__star">`;
    }).join('');
    
    reviewRatingDisplay.innerHTML = starsHTML;
  }
}

function renderReviewStarsInput() {
  const reviewStarsInput = document.getElementById('review-stars-input');
  const reviewForm = document.getElementById('review-form');
  
  if (reviewStarsInput && reviewForm) {
    const basePath = getBasePath();
    const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
    const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
    
    reviewForm.dataset.selectedRating = '0';
    let selectedRating = 0;
    
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      return `<img src="${greyStarPath}" alt="star ${i + 1}" class="product-details__review-star-input" data-rating="${i + 1}">`;
    }).join('');
    
    reviewStarsInput.innerHTML = starsHTML;
    
    const stars = reviewStarsInput.querySelectorAll('.product-details__review-star-input');
    stars.forEach((star, index) => {
      star.addEventListener('click', () => {
        selectedRating = index + 1;
        reviewForm.dataset.selectedRating = selectedRating.toString();
        updateStarsDisplay(stars, selectedRating, yellowStarPath, greyStarPath);
      });
      
      star.addEventListener('mouseenter', () => {
        updateStarsDisplay(stars, index + 1, yellowStarPath, greyStarPath);
      });
    });
    
    reviewStarsInput.addEventListener('mouseleave', () => {
      updateStarsDisplay(stars, selectedRating, yellowStarPath, greyStarPath);
    });
  }
}

function updateStarsDisplay(stars, rating, yellowStarPath, greyStarPath) {
  stars.forEach((star, index) => {
    if (index < rating) {
      star.src = yellowStarPath;
    } else {
      star.src = greyStarPath;
    }
  });
}

function updateReviewsHeading(product) {
  const reviewsHeading = document.getElementById('reviews-heading');
  if (reviewsHeading) {
    let count = product.reviewsCount || product.reviews || 0;
    
    if (count === 0) {
      const reviewItems = document.querySelectorAll('.product-details__review-item:not(.product-details__review-item--hardcoded)');
      count = reviewItems.length;
    }

    if (count === 0) {
      count = 0;
    }
    
    const reviewText = count === 1 ? 'review' : 'reviews';
    reviewsHeading.textContent = `${count} ${reviewText} for ${product.name}`;
  }
}

// Product options
function parseSizes(sizeString) {
  const sizes = [];
  if (sizeString.includes(',')) {
    sizeString.split(',').forEach(s => sizes.push(s.trim()));
  } else if (sizeString.includes('-')) {
    const [start, end] = sizeString.split('-');
    const sizeOrder = ['S', 'M', 'L', 'XL'];
    const startIdx = sizeOrder.indexOf(start.trim());
    const endIdx = sizeOrder.indexOf(end.trim());
    if (startIdx !== -1 && endIdx !== -1) {
      for (let i = startIdx; i <= endIdx; i++) {
        sizes.push(sizeOrder[i]);
      }
    }
  } else {
    sizes.push(sizeString.trim());
  }
  return sizes;
}

function sortSizes(sizes) {
  const sizeOrder = ['S', 'M', 'L', 'XL'];
  const sizesCopy = [...sizes];
  sizesCopy.sort((a, b) => {
    const aIdx = sizeOrder.indexOf(a);
    const bIdx = sizeOrder.indexOf(b);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });
  return sizesCopy;
}

function populateSizeSelect(sizeSelect, product) {
  if (!sizeSelect || !product?.size) return;
  
  sizeSelect.innerHTML = '<option value="">Choose option</option>';
  const sizes = parseSizes(product.size);
  const sortedSizes = sortSizes(sizes);
  
  sortedSizes.forEach(size => {
    const option = document.createElement('option');
    option.value = size;
    option.textContent = size;
      if (size === product.size || product.size?.includes(size)) {
      option.selected = true;
    }
    sizeSelect.appendChild(option);
  });
}

function populateColorSelect(colorSelect, product) {
  if (!colorSelect || !product?.color) return;
  
  colorSelect.innerHTML = '<option value="">Choose option</option>';
  const option = document.createElement('option');
  option.value = product.color;
  option.textContent = product.color.charAt(0).toUpperCase() + product.color.slice(1);
  option.selected = true;
  colorSelect.appendChild(option);
}

function populateCategorySelect(categorySelect, product) {
  if (!categorySelect || !product?.category) return;
  
  categorySelect.innerHTML = '<option value="">Choose option</option>';
  const option = document.createElement('option');
  option.value = product.category;
  option.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  option.selected = true;
  categorySelect.appendChild(option);
}

function populateOptions(product) {
  const sizeSelect = document.getElementById('product-size');
  populateSizeSelect(sizeSelect, product);

  const colorSelect = document.getElementById('product-color');
  populateColorSelect(colorSelect, product);

  const categorySelect = document.getElementById('product-category');
  populateCategorySelect(categorySelect, product);
}

async function initProductPage() {
  const product = await loadProduct();
  if (product) {
    renderProductDetails(product);
    setupEventListeners(product);
    loadRelatedProducts(product);
  }
}

// Event handlers
function setupEventListeners(product) {
  const decreaseBtn = document.getElementById('quantity-decrease');
  const increaseBtn = document.getElementById('quantity-increase');
  const quantityInput = document.getElementById('quantity-input');

  if (decreaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });
  }

  if (increaseBtn && quantityInput) {
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value) || 1;
      quantityInput.value = currentValue + 1;
    });
  }

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn && product) {
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value) || 1;
      if (product?.id) {
        addToCart(product.id, quantity);
      } else {
        alert('Error: Product information not loaded');
      }
    });
  }

  const tabHeaders = document.querySelectorAll('.product-details__tab-header');
  tabHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const tabName = header.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleReviewSubmit();
    });
  }

  const thumbnails = document.querySelectorAll('.product-details__thumbnail img');
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', () => {
      const mainImage = document.getElementById('product-main-image');
      if (mainImage) {
        mainImage.src = thumbnail.src;
      }
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.product-details__tab-header').forEach(header => {
    header.classList.remove('product-details__tab-header--active');
  });
  document.querySelectorAll('.product-details__tab-panel').forEach(panel => {
    panel.classList.remove('product-details__tab-panel--active');
  });

  const selectedHeader = document.querySelector(`[data-tab="${tabName}"]`);
  const selectedPanel = document.getElementById(`tab-${tabName}`);
  selectedHeader?.classList.add('product-details__tab-header--active');
  selectedPanel?.classList.add('product-details__tab-panel--active');
}

function handleReviewSubmit() {
  const reviewForm = document.getElementById('review-form');
  const messageDiv = document.getElementById('review-message');
  
  if (!reviewForm || !messageDiv) return;

  const formData = new FormData(reviewForm);
  const name = formData.get('name') || '';
  const email = formData.get('email') || '';
  const comment = formData.get('comment') || '';

  const selectedRating = parseInt(reviewForm?.dataset?.selectedRating) || 0;

  messageDiv.textContent = '';
  messageDiv.className = 'product-details__review-message';

  if (!name?.trim()) {
    showReviewMessage('Please enter your name.', 'error');
    return;
  }

  if (!email?.trim()) {
    showReviewMessage('Please enter your email address.', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showReviewMessage('Please enter a valid email address.', 'error');
    return;
  }

  if (!comment?.trim()) {
    showReviewMessage('Please enter your review.', 'error');
    return;
  }

  if (!selectedRating || selectedRating === 0) {
    showReviewMessage('Please rate the product.', 'error');
    return;
  }

  addReviewToList(name, selectedRating, comment);

  updateReviewsCount();

  updateProductRating();

  showReviewMessage('Thank you for your review! Your review has been submitted successfully.', 'success');

  reviewForm.reset();
  const stars = document.querySelectorAll('.product-details__review-star-input');
  const basePath = getBasePath();
  const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
  stars.forEach(star => {
    star.src = greyStarPath;
  });
  reviewForm.dataset.selectedRating = '0';
}

function addReviewToList(name, rating, comment) {
  const reviewsList = document.querySelector('.product-details__reviews-list');
  if (!reviewsList) return;
  
  const basePath = getBasePath();
  const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
  const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
  
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  
  const roundedRating = Math.round(rating);
  const starsHTML = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < roundedRating;
    const starPath = isFilled ? yellowStarPath : greyStarPath;
    return `<img src="${starPath}" alt="star" class="product-details__star">`;
  }).join('');
  
  const reviewItem = document.createElement('div');
  reviewItem.className = 'product-details__review-item';
  reviewItem.setAttribute('data-rating', rating);
  reviewItem.innerHTML = `
    <div class="product-details__review-header">
      <div class="product-details__review-author">
        <div class="product-details__review-avatar">
          <span>${initials}</span>
        </div>
        <div class="product-details__review-author-info">
          <span class="product-details__review-name">${name}</span>
          <span class="product-details__review-date">/ ${dateStr}</span>
        </div>
      </div>
      <div class="product-details__review-rating">
        ${starsHTML}
      </div>
    </div>
    <p class="product-details__review-text">${comment}</p>
  `;
  
  const heading = reviewsList.querySelector('.product-details__reviews-heading');
  if (heading?.nextSibling) {
    reviewsList.insertBefore(reviewItem, heading.nextSibling);
  } else {
    reviewsList.appendChild(reviewItem);
  }
  
  if (window.currentProduct?.id) {
    saveReviewToStorage(window.currentProduct.id, {
      name: name,
      rating: rating,
      comment: comment,
      date: dateStr
    });
  }
}

function saveReviewToStorage(productId, review) {
  try {
    const key = `product_reviews_${productId}`;
    const reviews = getReviewsFromStorage(productId);
    reviews.push(review);
    localStorage.setItem(key, JSON.stringify(reviews));
  } catch (error) {
  }
}

function getReviewsFromStorage(productId) {
  try {
    const key = `product_reviews_${productId}`;
    const reviewsJson = localStorage.getItem(key);
    return reviewsJson ? JSON.parse(reviewsJson) : [];
  } catch (error) {
    return [];
  }
}

function loadSavedReviews(productId) {
  const reviews = getReviewsFromStorage(productId);
  if (reviews.length === 0) return;
  
  const reviewsList = document.querySelector('.product-details__reviews-list');
  if (!reviewsList) return;
  
  const basePath = getBasePath();
  const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
  const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
  
  const heading = reviewsList?.querySelector('.product-details__reviews-heading');
  reviews.forEach(review => {
    const initials = review?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '';

    const roundedRating = Math.round(review.rating);
    const starsHTML = Array.from({ length: 5 }, (_, i) => {
      const isFilled = i < roundedRating;
      const starPath = isFilled ? yellowStarPath : greyStarPath;
      return `<img src="${starPath}" alt="star" class="product-details__star">`;
    }).join('');

    const reviewItem = document.createElement('div');
    reviewItem.className = 'product-details__review-item';
    reviewItem.setAttribute('data-rating', review.rating);
    reviewItem.innerHTML = `
      <div class="product-details__review-header">
        <div class="product-details__review-author">
          <div class="product-details__review-avatar">
            <span>${initials}</span>
          </div>
          <div class="product-details__review-author-info">
            <span class="product-details__review-name">${review?.name || ''}</span>
            <span class="product-details__review-date">/ ${review?.date || ''}</span>
          </div>
        </div>
        <div class="product-details__review-rating">
          ${starsHTML}
        </div>
      </div>
      <p class="product-details__review-text">${review?.comment || ''}</p>
    `;
    
    const hardcodedReview = reviewsList?.querySelector('.product-details__review-item--hardcoded');
    if (hardcodedReview) {
      reviewsList.insertBefore(reviewItem, hardcodedReview);
    } else if (heading?.nextSibling) {
      reviewsList.insertBefore(reviewItem, heading.nextSibling);
    } else {
      reviewsList?.appendChild(reviewItem);
    }
  });
  
  updateReviewsCount();
  updateProductRating();
}

function updateProductRating() {
  const productRating = document.getElementById('product-rating');
  if (!productRating) return;
  
  const ratings = [];

  if (window.currentProduct?.rating) {
    ratings.push(window.currentProduct.rating);
  }

  const reviewItems = document.querySelectorAll('.product-details__review-item:not(.product-details__review-item--hardcoded)');
  reviewItems.forEach(item => {
    const rating = parseFloat(item.getAttribute('data-rating'));
    if (!isNaN(rating) && rating > 0) {
      ratings.push(rating);
    }
  });
  
  let roundedRating;
  if (ratings.length > 0) {
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    const averageRating = sum / ratings.length;
    roundedRating = Math.round(averageRating);
  } else {
    return;
  }
  
  const basePath = getBasePath();
  const yellowStarPath = `${basePath}assets/images/icons/rating-yellow-star.svg`;
  const greyStarPath = `${basePath}assets/images/icons/rating-greyStar.svg`;
  
  const starsHTML = Array.from({ length: 5 }, (_, i) => {
    const isFilled = i < roundedRating;
    const starPath = isFilled ? yellowStarPath : greyStarPath;
    return `<img src="${starPath}" alt="star" class="product-details__star">`;
  }).join('');
  
  productRating.innerHTML = starsHTML;
}

// Update reviews count
function updateReviewsCount() {
  const reviewItems = document.querySelectorAll('.product-details__review-item:not(.product-details__review-item--hardcoded)');
  const count = reviewItems.length;
  
  const reviewsCount = document.getElementById('product-reviews-count');
  if (reviewsCount) {
    if (count === 1) {
      reviewsCount.textContent = `(${count} Client Review)`;
    } else {
      reviewsCount.textContent = `(${count} Clients Reviews)`;
    }
  }
  
  const reviewsHeading = document.getElementById('reviews-heading');
  if (reviewsHeading) {
    const productTitle = document.getElementById('product-title');
    const productName = productTitle ? productTitle.textContent : 'Product';
    const reviewText = count === 1 ? 'review' : 'reviews';
    reviewsHeading.textContent = `${count} ${reviewText} for ${productName}`;
  }
}

function showReviewMessage(message, type) {
  const messageDiv = document.getElementById('review-message');
  if (!messageDiv) return;
  
  messageDiv.textContent = message;
  messageDiv.className = `product-details__review-message product-details__review-message--${type}`;
  
  if (type === 'success') {
    messageDiv.style.color = '#28a745';
    messageDiv.style.backgroundColor = '#d4edda';
    messageDiv.style.border = '1px solid #c3e6cb';
  } else {
    messageDiv.style.color = '#dc3545';
    messageDiv.style.backgroundColor = '#f8d7da';
    messageDiv.style.border = '1px solid #f5c6cb';
  }
  
  messageDiv.style.padding = '12px 16px';
  messageDiv.style.borderRadius = '4px';
  messageDiv.style.marginTop = '10px';
  messageDiv.style.display = 'block';
}

// Add to cart
async function addToCart(productId, quantity) {
  try {
    if (!productId) {
      alert('Error: Product ID is missing');
      return;
    }
    
    const basePath = getBasePath();
    const jsonPath = `${basePath}assets/data.json`;
    
    const response = await fetch(jsonPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const product = data.data.find(item => item.id === productId);
    
    if (!product) {
      alert('Product not found');
      return;
    }
    
    const imageUrl = getProductImageUrl(product);
    
    const sizeSelect = document.getElementById('product-size');
    const colorSelect = document.getElementById('product-color');
    const selectedSize = sizeSelect ? sizeSelect.value : '';
    const selectedColor = colorSelect ? colorSelect.value : '';
    
    addItemToCart(productId, quantity, {
      name: product.name,
      price: product.price,
      image: imageUrl,
      size: selectedSize,
      color: selectedColor
    });
    
    if (typeof updateCartCounter === 'function') {
      updateCartCounter();
    }
    
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Added';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    }
  } catch (error) {
    alert('Error adding item to cart: ' + error.message);
  }
}

// Related products
async function loadRelatedProducts(currentProduct) {
  const basePath = getBasePath();
  const jsonPath = `${basePath}assets/data.json`;
  const response = await fetch(jsonPath);
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  
  let allProducts = data.data.filter(p => p.id !== currentProduct.id);
  
  const allProductsCopy = [...allProducts];
  allProductsCopy.sort(() => 0.5 - Math.random());
  const relatedProducts = allProductsCopy.slice(0, 4);
  
  renderRelatedProducts(relatedProducts);
}

function renderRelatedProductCard(product) {
  const imageUrl = getProductImageUrl(product);
  const saleBadge = product.salesStatus ? '<div class="product-card__tag">SALE</div>' : '';
  return `
    <div class="product-card" style="text-decoration: none; color: inherit;">
      <a href="product-card.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
        <div class="product-card__image-wrapper">
          ${saleBadge}
          <img src="${imageUrl}" alt="${product.name}" class="product-card__image">
        </div>
      </a>
      <div class="product-card__content">
        <a href="product-card.html?id=${product.id}" style="text-decoration: none; color: inherit;">
          <h3 class="product-card__name">${product.name}</h3>
          <div class="product-card__price">$${product.price}</div>
        </a>
        <button class="product-card__btn btn btn--primary" data-product-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;
}

function attachRelatedProductsAddToCartListeners(container) {
  container.querySelectorAll('.product-card__btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const productId = btn.getAttribute('data-product-id');
      if (productId) {
        const originalText = btn.textContent;
        await addToCart(productId, 1);
        btn.textContent = 'Added';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    });
  });
}

function renderRelatedProducts(products) {
  const relatedGrid = document.getElementById('related-products-grid');
  const relatedSlider = document.getElementById('related-products-slider');
  
  if (!relatedGrid && !relatedSlider) {
    return;
  }
  
  if (window.innerWidth > 1440) {
    if (relatedGrid) {
      relatedGrid.innerHTML = products.map(product => renderRelatedProductCard(product)).join('');
      relatedGrid.style.display = 'grid';
      if (relatedSlider) relatedSlider.style.display = 'none';
      attachRelatedProductsAddToCartListeners(relatedGrid);
    }
  } else if (relatedSlider) {
    const sliderInstance = new RelatedProductsSlider(relatedSlider, products);
    if (sliderInstance) {
      relatedSlider.style.display = 'block';
      if (relatedGrid) relatedGrid.style.display = 'none';
    }
  }
  
  window.relatedProductsData = products;
  
  if (!window.relatedProductsResizeHandler) {
    let resizeTimeout;
    window.relatedProductsResizeHandler = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const relatedGrid = document.getElementById('related-products-grid');
        const relatedSlider = document.getElementById('related-products-slider');
        if ((relatedGrid || relatedSlider) && window.relatedProductsData) {
          renderRelatedProducts(window.relatedProductsData);
        }
      }, 250);
    };
    window.addEventListener('resize', window.relatedProductsResizeHandler);
  }
}

class RelatedProductsSlider {
  constructor(container, products) {
    this.container = container;
    this.products = products;
    this.currentIndex = 0;
    this.init();
  }

  init() {
    if (!this.container || this.products.length === 0) return;
    
    const allProducts = [...this.products, ...this.products, ...this.products];
    this.currentIndex = this.products.length;
    
    this.container.innerHTML = this.buildSliderHTML(allProducts);
    this.attachEventListeners();
    this.updateSlider();
    this.attachAddToCartListeners();
  }

  buildSliderHTML(allProducts) {
    const cardsHTML = allProducts.map(product => renderRelatedProductCard(product)).join('');
    return `
      <div class="product-details__related-slider-wrapper">
        <button class="slider-arrow slider-arrow--left" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="product-details__related-slider-container">
          <div class="product-details__related-slider-track">
            ${cardsHTML}
          </div>
        </div>
        <button class="slider-arrow slider-arrow--right" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  }


  attachAddToCartListeners() {
    attachRelatedProductsAddToCartListeners(this.container);
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

  prevSlide() {
    this.currentIndex--;
    this.updateSlider();
    
    const track = this.container.querySelector('.product-details__related-slider-track');
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
    
    const track = this.container.querySelector('.product-details__related-slider-track');
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
    const track = this.container.querySelector('.product-details__related-slider-track');
    if (track) {
      let cardWidth;
      let gap;
      
      if (window.innerWidth <= 768) {
        cardWidth = 250;
        gap = 20;
      } else {
        cardWidth = 296;
        gap = 30;
      }
      
      const translateX = -(this.currentIndex * (cardWidth + gap));
      track.style.transform = `translateX(${translateX}px)`;
      if (!track.style.transition) {
        track.style.transition = 'transform 0.5s ease';
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initProductPage();
});

