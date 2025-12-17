// Cart page functionality

let cartItems = [];

// Get base path function
function getBasePath() {
  const path = window.location.pathname;
  const isSubPage = path.includes('/html/');
  const srcPath = '/src';
  const slash = '/';
  
  if (isSubPage) {
    return `${srcPath}${slash}`;
  }
  return `${srcPath}${slash}`;
}

// Cart storage functions (from main.js)
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
    if (typeof updateCartCounter === 'function') {
      updateCartCounter();
    }
  } catch (error) {
    console.error('Error saving cart:', error);
  }
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

// Order history functions
function getOrderHistory() {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return [];
    const orders = localStorage.getItem(`orders_${userEmail}`);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    return [];
  }
}

function saveOrderHistory(orders) {
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      localStorage.setItem(`orders_${userEmail}`, JSON.stringify(orders));
    }
  } catch (error) {
    console.error('Error saving order history:', error);
  }
}

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
    checkoutBtn.addEventListener('click', async () => {
      if (cartItems.length === 0) {
        alert('Your cart is empty');
        return;
      }
      
      // Check if user is authenticated
      const isAuth = typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated();
      const isLoggedInOld = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isAuth && !isLoggedInOld) {
        alert('Please log in to place an order');
        // Open login modal if available
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
          loginModal.style.display = 'flex';
        } else {
          // Redirect to home page where login modal should be available
          window.location.href = `${getBasePath()}index.html`;
        }
        return;
      }
      
      // Calculate order total
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = 30;
      const discountThreshold = 3000;
      const discount = subtotal > discountThreshold ? subtotal * 0.1 : 0;
      const total = subtotal - discount + shipping;
      
      try {
        // Try to create order via API if authenticated
        if (isAuth && typeof window !== 'undefined' && window.apiClient) {
          const orderData = {
            items: cartItems.map(item => ({
              product_id: item.id || null,
              product_name: item.name,
              product_price: item.price,
              quantity: item.quantity,
              size: item.size || null,
              color: item.color || null,
              subtotal: item.price * item.quantity
            })),
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total,
            shipping_address: null
          };
          
          const order = await window.apiClient.createOrder(orderData);
          
          // Save order to user's order history (localStorage backup)
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail) {
            const orders = getOrderHistory();
            const localOrder = {
              id: order.order_number || `ORD-${Date.now()}`,
              date: Date.now(),
              items: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                size: item.size,
                color: item.color
              })),
              subtotal: subtotal,
              shipping: shipping,
              discount: discount,
              total: total,
              status: 'pending'
            };
            orders.unshift(localOrder);
            saveOrderHistory(orders);
          }
          
          // Clear cart
          cartItems.length = 0;
          saveCartToStorage(cartItems);
          updateCartCounter();
          alert('Thank you for your purchase. Your order has been placed!');
          renderCartItems();
        } else {
          // Fallback to localStorage if API is not available
          const order = {
            id: `ORD-${Date.now()}`,
            date: Date.now(),
            items: cartItems.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              size: item.size,
              color: item.color
            })),
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: total,
            status: 'pending'
          };
          
          // Save order to user's order history
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail) {
            const orders = getOrderHistory();
            orders.unshift(order);
            saveOrderHistory(orders);
          }
          
          // Clear cart
          cartItems.length = 0;
          saveCartToStorage(cartItems);
          updateCartCounter();
          alert('Thank you for your purchase. Your order has been placed!');
          renderCartItems();
        }
      } catch (error) {
        console.error('Error creating order:', error);
        alert('Error placing order. Please try again or log in.');
      }
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

