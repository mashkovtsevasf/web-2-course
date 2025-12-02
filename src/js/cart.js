// Cart page functionality

let cartItems = [];

// Rendering
function renderCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  if (!cartItemsContainer) return;
  
  if (cartItems.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart__empty">
        <p class="cart__empty-message">Your cart is empty. Use the catalog to add new items.</p>
      </div>
    `;
    updateCartSummary();
    updateCartCounter();
    return;
  }
  
  const basePath = getBasePath();
  
  cartItemsContainer.innerHTML = cartItems.map(item => {
    const total = item.price * item.quantity;
    let imagePath = item.image;
    if (imagePath?.startsWith('assets/') && !imagePath?.startsWith(basePath)) {
      imagePath = `${basePath}${imagePath}`;
    }
    
    return `
      <div class="cart__item" data-item-id="${item.id}">
        <div class="cart__item-cell cart__item-cell--image">
          <img src="${imagePath}" alt="${item.name}" class="cart__item-image">
        </div>
        <div class="cart__item-cell cart__item-cell--name">
          <span class="cart__item-name">${item.name}</span>
        </div>
        <div class="cart__item-cell cart__item-cell--price" data-label="Price:">
          <span class="cart__item-price">$${item.price}</span>
        </div>
        <div class="cart__item-cell cart__item-cell--quantity" data-label="Quantity:">
          <div class="cart__quantity">
            <button class="cart__quantity-decrease" data-item-id="${item.id}">-</button>
            <input type="number" class="cart__quantity-input" value="${item.quantity}" min="1" data-item-id="${item.id}">
            <button class="cart__quantity-increase" data-item-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart__item-cell cart__item-cell--total" data-label="Total:">
          <span class="cart__item-total">$${total}</span>
        </div>
        <div class="cart__item-cell cart__item-cell--delete" data-label="">
          <button class="cart__delete-btn" data-item-id="${item.id}">
            <img src="${getBasePath()}assets/images/icons/delete-icon.svg" alt="Delete" class="cart__delete-icon">
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  updateCartSummary();
  setupEventListeners();
}

function updateCartSummary() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cartItems.length > 0 ? 30 : 0;
  
  const discountThreshold = 3000;
  const discount = subtotal > discountThreshold ? subtotal * 0.1 : 0;
  const total = subtotal - discount + shipping;
  
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const shippingEl = document.getElementById('cart-shipping');
  const discountEl = document.getElementById('cart-discount');
  const discountRow = document.getElementById('cart-discount-row');
  
  if (subtotalEl) subtotalEl.textContent = `$${subtotal}`;
  if (shippingEl) shippingEl.textContent = `$${shipping}`;
  if (totalEl) totalEl.textContent = `$${total}`;
  
  if (discountRow) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      if (discountEl) discountEl.textContent = `-$${discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
  
  document.querySelectorAll('.cart__item[data-item-id]').forEach(itemEl => {
    const itemId = itemEl.getAttribute('data-item-id');
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
      const totalCell = itemEl.querySelector('.cart__item-total');
      if (totalCell) {
        totalCell.textContent = `$${item.price * item.quantity}`;
      }
    }
  });
  
  updateCartCounter();
  saveCartToStorage(cartItems);
}

function setupEventListeners() {
  document.querySelectorAll('.cart__quantity-decrease').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      const item = cartItems.find(i => i.id === itemId);
      if (item && item.quantity > 1) {
        item.quantity--;
        renderCartItems();
      }
    });
  });
  
  document.querySelectorAll('.cart__quantity-increase').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      const item = cartItems.find(i => i.id === itemId);
      if (item) {
        item.quantity++;
        renderCartItems();
      }
    });
  });
  
  document.querySelectorAll('.cart__quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const itemId = e.target.getAttribute('data-item-id');
      const item = cartItems.find(i => i.id === itemId);
      const newQuantity = parseInt(e.target.value) || 1;
      if (item && newQuantity >= 1) {
        item.quantity = newQuantity;
        renderCartItems();
      }
    });
  });
  
  document.querySelectorAll('.cart__delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.closest('.cart__delete-btn').getAttribute('data-item-id');
      const index = cartItems.findIndex(i => i.id === itemId);
      if (index > -1) {
        cartItems.splice(index, 1);
        saveCartToStorage(cartItems);
        renderCartItems();
      }
    });
  });
  
  const clearBtn = document.querySelector('.cart__clear-btn');
  if (clearBtn && !clearBtn.dataset.listenerAdded) {
    clearBtn.dataset.listenerAdded = 'true';
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the shopping cart?')) {
        cartItems.length = 0;
        saveCartToStorage(cartItems);
        updateCartCounter();
        renderCartItems();
      }
    });
  }
  
  const continueBtn = document.querySelector('.cart__continue-btn');
  if (continueBtn && !continueBtn.dataset.listenerAdded) {
    continueBtn.dataset.listenerAdded = 'true';
    continueBtn.addEventListener('click', () => {
      window.location.href = `${getBasePath()}html/catalog.html`;
    });
  }
  
  const checkoutBtn = document.querySelector('.cart__checkout-btn');
  if (checkoutBtn && !checkoutBtn.dataset.listenerAdded) {
    checkoutBtn.dataset.listenerAdded = 'true';
    checkoutBtn.addEventListener('click', () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      
      cartItems.length = 0;
      saveCartToStorage(cartItems);
      updateCartCounter();
      alert('Thank you for your purchase.');
      renderCartItems();
    });
  }
}

// Data loading
async function loadCartItemsFromStorage() {
  try {
    cartItems = getCartFromStorage();
    return cartItems;
  } catch (error) {
    cartItems = [];
    return cartItems;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCartItemsFromStorage();
  renderCartItems();
  updateCartCounter();
});

