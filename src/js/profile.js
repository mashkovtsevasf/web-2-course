function logout() {
  console.log('Logout called from profile.js');
  if (typeof window !== 'undefined' && window.apiClient) {
    try {
      if (window.apiClient.isAuthenticated && window.apiClient.isAuthenticated()) {
        window.apiClient.logout().catch(err => console.error('API logout error:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userName');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('authToken');
  localStorage.removeItem('userPhone');
  localStorage.removeItem('userAddress');
  localStorage.removeItem('cart');
  console.log('All user data cleared');
  window.location.href = window.location.origin + '/index.html';
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
function getRegisteredUsers() {
  try {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  } catch (error) {
    return [];
  }
}
function saveRegisteredUser(userData) {
  const users = getRegisteredUsers();
  const existingUserIndex = users.findIndex(u => u.email === userData.email);
  if (existingUserIndex !== -1) {
    users[existingUserIndex] = { ...users[existingUserIndex], ...userData };
  } else {
    users.push(userData);
  }
  localStorage.setItem('registeredUsers', JSON.stringify(users));
}
async function getOrderHistory() {
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const currentUserResponse = await window.apiClient.getCurrentUser();
      if (currentUserResponse && currentUserResponse.user && currentUserResponse.user.user_id) {
        const userId = currentUserResponse.user.user_id;
        const orders = await window.apiClient.getOrders(userId);
        return orders.map(order => ({
          id: order.order_number || order.order_id,
          order_id: order.order_id,
          order_number: order.order_number,
          date: order.created_at ? new Date(order.created_at).getTime() : Date.now(),
          items: order.items || [],
          subtotal: parseFloat(order.subtotal) || 0,
          shipping: parseFloat(order.shipping) || 0,
          discount: parseFloat(order.discount) || 0,
          total: parseFloat(order.total) || 0,
          status: (order.status || 'pending').toLowerCase().trim()
        }));
      }
    } catch (error) {
      console.error('Error loading order history from API:', error);
    }
  }
  try {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) return [];
    const orders = localStorage.getItem(`orders_${userEmail}`);
    return orders ? JSON.parse(orders) : [];
  } catch (error) {
    console.error('Error loading order history from localStorage:', error);
    return [];
  }
}
async function renderOrderHistory() {
  const orderHistoryContainer = document.querySelector('.order-history');
  if (!orderHistoryContainer) return;
  const orders = await getOrderHistory();
  if (orders.length === 0) {
    orderHistoryContainer.innerHTML = `
      <div class="order-history__empty">
        <p>You haven't placed any orders yet.</p>
      </div>
    `;
    return;
  }
  orderHistoryContainer.innerHTML = orders.map(order => {
    const status = (order.status || 'pending').toLowerCase().trim();
    const statusClass = status === 'completed' ? 'order-history__status--completed' : 
                       status === 'processing' ? 'order-history__status--processing' : 
                       'order-history__status--pending';
    const statusText = status === 'completed' ? 'Completed' : 
                      status === 'processing' ? 'Processing' : 
                      'Pending';
    const orderDate = order.date ? new Date(order.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A';
    const orderNumber = order.order_number || order.id || 'N/A';
    const displayNumber = orderNumber.length > 6 ? orderNumber.slice(-6) : orderNumber;
    return `
      <div class="order-history__item">
        <div class="order-history__header">
          <span class="order-history__number">Order #${displayNumber}</span>
          <span class="order-history__date">${orderDate}</span>
          <span class="order-history__status ${statusClass}">${statusText}</span>
        </div>
        <div class="order-history__details">
          <p class="order-history__total">Total: $${order.total.toFixed(2)}</p>
          <p class="order-history__items">${order.items.length} item${order.items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    `;
  }).join('');
}
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logout-profile-btn');
  const saveBtn = document.querySelector('.profile-form .btn--primary');
  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  const phoneInput = document.getElementById('profile-phone-input');
  const addressInput = document.getElementById('profile-address-input');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        logout();
      }
    });
  }
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const userName = nameInput ? nameInput.value.trim() : '';
      const userEmail = emailInput ? emailInput.value.trim() : '';
      const userPhone = phoneInput ? phoneInput.value.trim() : '';
      const userAddress = addressInput ? addressInput.value.trim() : '';
      if (!userName) {
        alert('Please enter your name');
        if (nameInput) nameInput.focus();
        return;
      }
      if (!userEmail) {
        alert('Please enter your email');
        if (emailInput) emailInput.focus();
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userEmail)) {
        alert('Please enter a valid email address');
        if (emailInput) emailInput.focus();
        return;
      }
      if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
        try {
          const currentUserResponse = await window.apiClient.getCurrentUser();
          if (currentUserResponse && currentUserResponse.user && currentUserResponse.user.user_id) {
            const userId = currentUserResponse.user.user_id;
            await window.apiClient.updateUser(userId, {
              name: userName,
              phone: userPhone,
              address: userAddress
            });
            console.log('Profile updated via API');
          }
        } catch (error) {
          console.error('Failed to update profile via API:', error);
        }
      }
      const currentEmail = localStorage.getItem('userEmail');
      const currentUser = getRegisteredUsers().find(u => u.email === currentEmail);
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: userName,
          email: userEmail,
          phone: userPhone,
          address: userAddress
        };
        if (userEmail !== currentEmail) {
          const users = getRegisteredUsers();
          const filteredUsers = users.filter(u => u.email !== currentEmail);
          filteredUsers.push(updatedUser);
          localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers));
        } else {
          saveRegisteredUser(updatedUser);
        }
      }
      localStorage.setItem('userName', userName);
      localStorage.setItem('userEmail', userEmail);
      if (userPhone) localStorage.setItem('userPhone', userPhone);
      if (userAddress) localStorage.setItem('userAddress', userAddress);
      const nameDisplay = document.getElementById('profile-display-name');
      const emailDisplay = document.getElementById('profile-display-email');
      if (nameDisplay) nameDisplay.textContent = userName;
      if (emailDisplay) emailDisplay.textContent = userEmail;
      if (typeof loadHeader === 'function') {
        loadHeader();
      }
      alert('Profile updated successfully!');
    });
  }
  const userEmail = localStorage.getItem('userEmail');
  let userData = null;
  async function loadUserDataFromAPI() {
    if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
      try {
        const response = await window.apiClient.getCurrentUser();
        if (response && response.user) {
          const apiUser = response.user;
          if (apiUser.name) localStorage.setItem('userName', apiUser.name);
          if (apiUser.email) localStorage.setItem('userEmail', apiUser.email);
          if (apiUser.phone) localStorage.setItem('userPhone', apiUser.phone);
          if (apiUser.address) localStorage.setItem('userAddress', apiUser.address);
          if (apiUser.roles && apiUser.roles.length > 0) {
            const userRole = apiUser.roles.includes('admin') ? 'admin' : 'user';
            localStorage.setItem('userRole', userRole);
          }
          return apiUser;
        }
      } catch (error) {
        console.error('Failed to load user data from API:', error);
      }
    }
    return null;
  }
  async function loadUserData() {
    let apiUser = null;
    apiUser = await loadUserDataFromAPI();
  if (userEmail) {
    const registeredUsers = getRegisteredUsers();
    userData = registeredUsers.find(u => u.email === userEmail);
  }
    const userName = apiUser?.name || userData?.name || localStorage.getItem('userName');
    const userEmailFromStorage = apiUser?.email || userData?.email || userEmail;
    const userPhone = apiUser?.phone || userData?.phone || localStorage.getItem('userPhone');
    const userAddress = apiUser?.address || userData?.address || localStorage.getItem('userAddress');
    const userRole = apiUser?.roles?.includes('admin') ? 'admin' : 
                     (userData?.role || localStorage.getItem('userRole') || 'user');
  if (userName) {
    const nameDisplay = document.getElementById('profile-display-name');
    if (nameDisplay) nameDisplay.textContent = userName;
    if (nameInput) nameInput.value = userName;
  }
  if (userEmailFromStorage) {
    const emailDisplay = document.getElementById('profile-display-email');
    if (emailDisplay) emailDisplay.textContent = userEmailFromStorage;
    if (emailInput) emailInput.value = userEmailFromStorage;
  }
  const roleDisplay = document.querySelector('.profile-info__role');
  if (roleDisplay) {
    roleDisplay.textContent = userRole === 'admin' ? 'Admin' : 'Regular User';
  }
  if (userPhone && phoneInput) {
    phoneInput.value = userPhone;
  }
  if (userAddress && addressInput) {
    addressInput.value = userAddress;
  }
  }
  loadUserData().then(async () => {
    await renderOrderHistory();
  });
});
