async function loadProductsData() {
  try {
    if (typeof window !== 'undefined' && window.apiClient) {
      try {
        const apiProducts = await window.apiClient.getProducts();
        console.log('Loaded products from API for statistics:', apiProducts.length);
        return apiProducts;
      } catch (apiError) {
        console.log('Could not load products from API, falling back to JSON:', apiError);
      }
    }
    const basePath = getBasePath();
    const response = await fetch(`${basePath}assets/data.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const jsonProducts = data.data || [];
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const productsMap = new Map();
    jsonProducts.forEach(product => {
      productsMap.set(product.id, product);
    });
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
  const isGitHubPages = path.includes('/web-2-course/');
  const repoBase = isGitHubPages ? '/web-2-course' : '';
  const srcPath = `${repoBase}/src`;
  const slash = '/';
  return `${srcPath}${slash}`;
}
async function getAllOrders() {
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const orders = await window.apiClient.getOrders(); 
      return orders;
    } catch (error) {
      console.error('Error loading orders from API:', error);
    }
  }
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
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const users = await window.apiClient.getUsers();
      return users.length;
    } catch (error) {
      console.error('Error loading users from API:', error);
    }
  }
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
    const products = await loadProductsData();
    const productsCount = products.length;
    const orders = await getAllOrders();
    const ordersCount = orders.length;
    const usersCount = await getRegisteredUsersCount();
    const revenue = await calculateTotalRevenue();
    const ordersValue = document.getElementById('admin-orders-count');
    if (ordersValue) {
      ordersValue.textContent = ordersCount;
    }
    const usersValue = document.getElementById('admin-users-count');
    if (usersValue) {
      usersValue.textContent = usersCount;
    }
    const revenueValue = document.getElementById('admin-revenue-value');
    if (revenueValue) {
      revenueValue.textContent = `$${revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  } catch (error) {
    console.error('Error updating admin statistics:', error);
  }
}
window.updateAdminStatistics = updateAdminStatistics;
document.addEventListener('DOMContentLoaded', () => {
  updateAdminStatistics();
  setInterval(() => {
    updateAdminStatistics();
  }, 5000);
});
