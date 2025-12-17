// Admin users functionality

async function getAllUsers() {
  // Try to load from API first (if admin is authenticated)
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const users = await window.apiClient.getUsers();
      
      // Get orders count for each user
      const usersWithOrders = await Promise.all(users.map(async (user) => {
        try {
          const orders = await window.apiClient.getOrders(user.user_id);
          
          // Parse roles - API returns as comma-separated string
          let roles = [];
          if (user.roles) {
            if (typeof user.roles === 'string') {
              roles = user.roles.split(',').map(r => r.trim()).filter(r => r);
            } else if (Array.isArray(user.roles)) {
              roles = user.roles;
            }
          }
          
          return {
            ...user,
            roles: roles,
            ordersCount: orders.length || 0,
            registeredDate: user.created_at || user.registeredDate
          };
        } catch (error) {
          console.error(`Error loading orders for user ${user.user_id}:`, error);
          
          // Parse roles
          let roles = [];
          if (user.roles) {
            if (typeof user.roles === 'string') {
              roles = user.roles.split(',').map(r => r.trim()).filter(r => r);
            } else if (Array.isArray(user.roles)) {
              roles = user.roles;
            }
          }
          
          return {
            ...user,
            roles: roles,
            ordersCount: 0,
            registeredDate: user.created_at || user.registeredDate
          };
        }
      }));
      
      return usersWithOrders;
    } catch (error) {
      console.error('Error loading users from API:', error);
      // Fall through to localStorage
    }
  }
  
  // Fallback to localStorage
  try {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return users.map(user => {
      const orders = JSON.parse(localStorage.getItem(`orders_${user.email}`) || '[]');
      return {
        ...user,
        ordersCount: orders.length
      };
    });
  } catch (error) {
    console.error('Error loading users from localStorage:', error);
    return [];
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  let date;
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    // ISO date string from API
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
    // Unix timestamp
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }
  
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

async function renderUsers() {
  const users = await getAllUsers();
  const tbody = document.getElementById('users-table-body');
  
  if (!tbody) return;
  
  if (users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No users found</td></tr>';
    return;
  }
  
  tbody.innerHTML = users.map(user => {
    // Get role from roles array or role field
    const roles = user.roles || [];
    const role = roles.includes('admin') ? 'admin' : (user.role || 'user');
    const registeredDate = user.created_at || user.registeredDate || Date.now();
    
    return `
      <tr>
        <td>${user.name || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${user.phone || 'N/A'}</td>
        <td><span class="admin-status admin-status--${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span></td>
        <td>${formatDate(registeredDate)}</td>
        <td>${user.ordersCount || 0}</td>
        <td>
          <div class="admin-table__actions">
            <button class="admin-table__btn admin-table__btn--edit" onclick="viewUser('${user.user_id || user.email}')">View</button>
            ${role !== 'admin' ? `<button class="admin-table__btn admin-table__btn--delete" onclick="deleteUser('${user.user_id || user.email}')">Delete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function viewUser(userIdOrEmail) {
  console.log('Viewing user:', userIdOrEmail);
  
  const users = await getAllUsers();
  console.log('All users:', users);
  
  // Try to find user by different ID formats
  const user = users.find(u => {
    const uId = String(u.user_id || '');
    const uEmail = String(u.email || '');
    const searchId = String(userIdOrEmail);
    
    // Try exact matches first
    if (uId === searchId || uEmail === searchId) {
      return true;
    }
    
    // Try numeric comparison if both are numbers
    const searchNum = parseInt(searchId);
    const uIdNum = parseInt(uId);
    if (!isNaN(searchNum) && !isNaN(uIdNum) && uIdNum === searchNum) {
      return true;
    }
    
    return false;
  });
  
  console.log('Found user:', user);
  
  if (!user) {
    alert(`User not found. Searched for: ${userIdOrEmail}`);
    return;
  }
  
  let orders = [];
  // Try to get orders from API
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated() && user.user_id) {
    try {
      orders = await window.apiClient.getOrders(user.user_id);
      console.log('User orders from API:', orders);
    } catch (error) {
      console.error('Error loading user orders:', error);
      // Fallback to localStorage
      orders = JSON.parse(localStorage.getItem(`orders_${user.email}`) || '[]');
    }
  } else {
    orders = JSON.parse(localStorage.getItem(`orders_${user.email}`) || '[]');
  }
  
  const roles = user.roles || [];
  const role = roles.includes('admin') ? 'admin' : (user.role || 'user');
  
  // Build detailed user information
  const userName = user.name || 'N/A';
  const userEmail = user.email || 'N/A';
  const userPhone = user.phone || 'N/A';
  const userAddress = user.address || 'N/A';
  const registeredDate = formatDate(user.created_at || user.registeredDate);
  
  // Build orders list
  let ordersList = '';
  if (orders.length === 0) {
    ordersList = 'No orders';
  } else {
    ordersList = orders.map((order, index) => {
      const orderNumber = order.order_number || order.id || `Order ${index + 1}`;
      const orderTotal = parseFloat(order.total) || 0;
      const orderStatus = (order.status || 'pending').toLowerCase();
      const orderDate = order.created_at ? formatDate(order.created_at) : (order.date ? formatDate(order.date) : 'N/A');
      return `${index + 1}. ${orderNumber} - $${orderTotal.toFixed(2)} (${orderStatus}) - ${orderDate}`;
    }).join('\n');
  }
  
  const message = `USER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}
Address: ${userAddress}
Role: ${role}
Registered: ${registeredDate}

ORDER HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Orders: ${orders.length}

${ordersList}`;
  
  alert(message);
}

// Make function globally available
window.viewUser = viewUser;

async function deleteUser(userIdOrEmail) {
  console.log('Deleting user:', userIdOrEmail);
  
  if (confirm(`Are you sure you want to delete this user?`)) {
    // Try to delete via API
    if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
      try {
        // Try to find user to get user_id
        const users = await getAllUsers();
        const user = users.find(u => {
          const uId = String(u.user_id || '');
          const uEmail = String(u.email || '');
          const searchId = String(userIdOrEmail);
          
          if (uId === searchId || uEmail === searchId) {
            return true;
          }
          
          const searchNum = parseInt(searchId);
          const uIdNum = parseInt(uId);
          if (!isNaN(searchNum) && !isNaN(uIdNum) && uIdNum === searchNum) {
            return true;
          }
          
          return false;
        });
        
        if (user && user.user_id) {
          await window.apiClient.deleteUser(user.user_id);
          await renderUsers();
          alert('User deleted successfully!');
          return;
        } else {
          throw new Error('User not found or user_id not available');
        }
      } catch (error) {
        console.error('Error deleting user via API:', error);
        alert('Error deleting user: ' + (error.message || 'Unknown error'));
        return;
      }
    }
    
    // Fallback to localStorage
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const filteredUsers = users.filter(u => u.email !== userIdOrEmail && u.user_id !== userIdOrEmail);
      localStorage.setItem('registeredUsers', JSON.stringify(filteredUsers));
      localStorage.removeItem(`orders_${userIdOrEmail}`);
      await renderUsers();
      alert('User deleted successfully!');
    } catch (error) {
      alert('Error deleting user: ' + error.message);
    }
  }
}

// Make function globally available
window.deleteUser = deleteUser;

document.addEventListener('DOMContentLoaded', () => {
  renderUsers();
  
  // Auto-refresh users every 10 seconds
  setInterval(() => {
    renderUsers();
  }, 10000);
});


