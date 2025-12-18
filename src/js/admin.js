// Admin dashboard functionality

async function loadProductsData() {
  try {
    // Try to load from API first
    if (typeof window !== 'undefined' && window.apiClient) {
      try {
        const apiProducts = await window.apiClient.getProducts();
        console.log('Loaded products from API for statistics:', apiProducts.length);
        return apiProducts;
      } catch (apiError) {
        console.log('Could not load products from API, falling back to JSON:', apiError);
        // Fall through to JSON
      }
    }
    
    // Fallback to JSON
    const basePath = getBasePath();
    const response = await fetch(`${basePath}assets/data.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jsonProducts = data.data || [];
    
    // Also load from localStorage for backward compatibility
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    
    // Merge products
    const productsMap = new Map();
    
    // Add JSON products
    jsonProducts.forEach(product => {
      productsMap.set(product.id, product);
    });
    
    // Add localStorage products
    adminProducts.forEach(product => {
      productsMap.set(product.id, product);
    });
    
    return Array.from(productsMap.values());
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

function getBasePath() {
  const path = window.location.pathname;
  const isSubPage = path.includes('/html/');
  
  // Detect if we're on GitHub Pages (path contains repository name)
  const isGitHubPages = path.includes('/web-2-course/');
  const repoBase = isGitHubPages ? '/web-2-course' : '';
  
  const srcPath = `${repoBase}/src`;
  const slash = '/';
  
  return `${srcPath}${slash}`;
}

async function getAllOrders() {
  // Try to load from API first (if admin is authenticated)
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const orders = await window.apiClient.getOrders(); // Get all orders (admin can see all)
      return orders;
    } catch (error) {
      console.error('Error loading orders from API:', error);
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const allOrders = [];
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    registeredUsers.forEach(user => {
      const userOrders = JSON.parse(localStorage.getItem(`orders_${user.email}`) || '[]');
      allOrders.push(...userOrders);
    });
    
    return allOrders;
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
}

async function getRegisteredUsersCount() {
  // Try to load from API first
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const users = await window.apiClient.getUsers();
      return users.length;
    } catch (error) {
      console.error('Error loading users from API:', error);
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.length;
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return 0;
  }
}

async function calculateTotalRevenue() {
  const orders = await getAllOrders();
  return orders.reduce((total, order) => {
    const orderTotal = parseFloat(order.total) || 0;
    return total + orderTotal;
  }, 0);
}

async function updateAdminStatistics() {
  try {
    // Load products
    const products = await loadProductsData();
    const productsCount = products.length;
    
    // Load orders from API
    const orders = await getAllOrders();
    const ordersCount = orders.length;
    
    // Load users from API
    const usersCount = await getRegisteredUsersCount();
    
    // Calculate revenue
    const revenue = await calculateTotalRevenue();
    
    // Update Orders count
    const ordersValue = document.getElementById('admin-orders-count');
    if (ordersValue) {
      ordersValue.textContent = ordersCount;
    }
    
    // Update Users count
    const usersValue = document.getElementById('admin-users-count');
    if (usersValue) {
      usersValue.textContent = usersCount;
    }
    
    // Update Revenue
    const revenueValue = document.getElementById('admin-revenue-value');
    if (revenueValue) {
      revenueValue.textContent = `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  } catch (error) {
    console.error('Error updating admin statistics:', error);
  }
}

// Make updateAdminStatistics globally available
window.updateAdminStatistics = updateAdminStatistics;

document.addEventListener('DOMContentLoaded', () => {
  // Admin dashboard initialization
  updateAdminStatistics();
  
  // Auto-refresh statistics every 5 seconds (more frequent updates)
  setInterval(() => {
    updateAdminStatistics();
  }, 5000);
});

