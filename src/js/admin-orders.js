let cachedOrders = [];
let lastFetchTime = 0;
const CACHE_DURATION = 2000; 
async function getAllOrders(forceRefresh = false) {
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const now = Date.now();
      if (!forceRefresh && cachedOrders.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedOrders;
      }
      const orders = await window.apiClient.getOrders(); 
      const transformedOrders = orders.map(order => {
        const normalizedStatus = (order.status || 'pending').toLowerCase().trim();
        return {
          id: order.order_number || order.order_id,
          order_id: order.order_id,
          order_number: order.order_number,
          customerEmail: order.customer_email || order.email,
          customerName: order.customer_name || order.name || order.customer_email,
          date: order.created_at ? new Date(order.created_at).getTime() : Date.now(),
          items: order.items || [],
          subtotal: parseFloat(order.subtotal) || 0,
          shipping: parseFloat(order.shipping) || 0,
          discount: parseFloat(order.discount) || 0,
          total: parseFloat(order.total) || 0,
          status: normalizedStatus,
          shipping_address: order.shipping_address || null
        };
      });
      cachedOrders = transformedOrders;
      lastFetchTime = now;
      return transformedOrders;
    } catch (error) {
      console.error('Error loading orders from API:', error);
    }
  }
  try {
    const allOrders = [];
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    registeredUsers.forEach(user => {
      const userOrders = JSON.parse(localStorage.getItem(`orders_${user.email}`) || '[]');
      userOrders.forEach(order => {
        allOrders.push({
          ...order,
          customerEmail: user.email,
          customerName: user.name || user.email
        });
      });
    });
    return allOrders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } catch (error) {
    console.error('Error loading orders from localStorage:', error);
    return [];
  }
}
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  let date;
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    date = new Date(timestamp);
  } else if (typeof timestamp === 'number') {
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
async function renderOrders(forceRefresh = false) {
  const orders = await getAllOrders(forceRefresh);
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;
  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders found</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map((order) => {
    const itemsCount = order.items ? order.items.length : 0;
    const total = parseFloat(order.total) || 0;
    const status = (order.status || 'pending').toLowerCase().trim();
    const orderId = order.order_id || order.order_number || order.id || `ORD-${Date.now()}`;
    const orderNumber = order.order_number || orderId;
    const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
    const customerName = (order.customerName || order.customerEmail || 'N/A').replace(/'/g, "\\'");
    const safeOrderId = String(order.order_id || orderId).replace(/'/g, "\\'");
    return `
      <tr>
        <td>${orderNumber}</td>
        <td>${order.customerName || order.customerEmail || 'N/A'}</td>
        <td>${formatDate(order.date || order.created_at)}</td>
        <td>${itemsCount} item(s)</td>
        <td>$${total.toFixed(2)}</td>
        <td><span class="admin-status admin-status--${status}">${statusDisplay}</span></td>
        <td>
          <div class="admin-table__actions">
            <button class="admin-table__btn admin-table__btn--edit" onclick="viewOrder('${safeOrderId}')">View</button>
            ${status !== 'completed' ? `<button class="admin-table__btn admin-table__btn--delete" onclick="updateOrderStatus('${safeOrderId}', 'completed')">Complete</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
async function viewOrder(orderId) {
  console.log('Viewing order:', orderId);
  let order = null;
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      const orders = await getAllOrders(false); 
      const foundOrder = orders.find(o => 
        o.id === orderId || 
        o.order_number === orderId || 
        String(o.order_id) === String(orderId)
      );
      if (foundOrder && foundOrder.order_id) {
        const fullOrder = await window.apiClient.getOrder(foundOrder.order_id);
        order = {
          ...fullOrder,
          customerName: fullOrder.customer_name || foundOrder.customerName,
          customerEmail: fullOrder.customer_email || foundOrder.customerEmail,
          date: fullOrder.created_at ? new Date(fullOrder.created_at).getTime() : foundOrder.date,
          items: fullOrder.items || []
        };
      } else {
        order = foundOrder;
      }
    } catch (error) {
      console.error('Error loading order from API:', error);
      const orders = await getAllOrders();
      order = orders.find(o => o.id === orderId || o.order_number === orderId || String(o.order_id) === String(orderId));
    }
  } else {
    const orders = await getAllOrders();
    order = orders.find(o => o.id === orderId || o.order_number === orderId || String(o.order_id) === String(orderId));
  }
  if (!order) {
    alert('Order not found');
    return;
  }
  const customerName = order.customerName || order.customer_name || 'N/A';
  const customerEmail = order.customerEmail || order.customer_email || 'N/A';
  const orderDate = formatDate(order.date || order.created_at);
  const orderTotal = parseFloat(order.total) || 0;
  const orderStatus = (order.status || 'pending').toLowerCase();
  const shippingAddress = order.shipping_address || 'N/A';
  const items = order.items || [];
  let itemsList = '';
  if (items.length === 0) {
    itemsList = 'No items';
  } else {
    itemsList = items.map((item, index) => {
      const itemName = item.product_name || item.name || 'Unknown Product';
      const quantity = item.quantity || 1;
      const price = parseFloat(item.product_price || item.price || 0);
      const subtotal = price * quantity;
      const size = item.size ? `, Size: ${item.size}` : '';
      const color = item.color ? `, Color: ${item.color}` : '';
      return `${index + 1}. ${itemName}${size}${color}\n   Quantity: ${quantity} x $${price.toFixed(2)} = $${subtotal.toFixed(2)}`;
    }).join('\n\n');
  }
  const subtotal = parseFloat(order.subtotal) || 0;
  const shipping = parseFloat(order.shipping) || 0;
  const discount = parseFloat(order.discount) || 0;
  const message = `ORDER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order Number: ${order.order_number || order.id || orderId}
Status: ${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
Date: ${orderDate}
CUSTOMER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${customerName}
Email: ${customerEmail}
Shipping Address: ${shippingAddress}
ORDER ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemsList}
ORDER SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Subtotal: $${subtotal.toFixed(2)}
Shipping: $${shipping.toFixed(2)}
${discount > 0 ? `Discount: -$${discount.toFixed(2)}\n` : ''}Total: $${orderTotal.toFixed(2)}`;
  alert(message);
}
async function updateOrderStatus(orderId, newStatus) {
  console.log('Updating order status:', orderId, newStatus);
  const orders = await getAllOrders(true);
  console.log('All orders:', orders);
  const order = orders.find(o => {
    const oId = String(o.id || '');
    const oOrderNumber = String(o.order_number || '');
    const oOrderId = String(o.order_id || '');
    const searchId = String(orderId);
    if (oId === searchId || oOrderNumber === searchId || oOrderId === searchId) {
      return true;
    }
    const searchNum = parseInt(searchId);
    const oIdNum = parseInt(oId);
    const oOrderIdNum = parseInt(oOrderId);
    if (!isNaN(searchNum)) {
      if (!isNaN(oIdNum) && oIdNum === searchNum) return true;
      if (!isNaN(oOrderIdNum) && oOrderIdNum === searchNum) return true;
    }
    return false;
  });
  console.log('Found order:', order);
  if (!order) {
    alert(`Order not found. Searched for: ${orderId}`);
    return;
  }
  if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
    try {
      let orderIdToUpdate = order.order_id;
      if (!orderIdToUpdate) {
        if (order.order_number) {
          try {
            const allOrdersFromAPI = await window.apiClient.getOrders();
            const apiOrder = allOrdersFromAPI.find(o => 
              o.order_number === order.order_number || 
              String(o.order_id) === String(orderId)
            );
            if (apiOrder) {
              orderIdToUpdate = apiOrder.order_id;
            }
          } catch (e) {
            console.error('Error finding order in API:', e);
          }
        }
        if (!orderIdToUpdate && !isNaN(parseInt(orderId))) {
          orderIdToUpdate = parseInt(orderId);
        }
      }
      if (!orderIdToUpdate) {
        throw new Error('Could not determine order_id for API update');
      }
      const normalizedStatus = newStatus.toLowerCase();
      const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
      if (!validStatuses.includes(normalizedStatus)) {
        throw new Error(`Invalid status: ${normalizedStatus}. Must be one of: ${validStatuses.join(', ')}`);
      }
      console.log('Updating order via API with order_id:', orderIdToUpdate, 'status:', normalizedStatus);
      const updatedOrder = await window.apiClient.updateOrderStatus(orderIdToUpdate, normalizedStatus);
      console.log('Order updated successfully:', updatedOrder);
      cachedOrders = [];
      lastFetchTime = 0;
      await new Promise(resolve => setTimeout(resolve, 200));
      const freshOrders = await window.apiClient.getOrders();
      console.log('Fresh orders from API:', freshOrders);
      const transformedOrders = freshOrders.map(order => {
        const normalizedStatus = (order.status || 'pending').toLowerCase().trim();
        console.log(`Order ${order.order_number || order.order_id}: API status="${order.status}", normalized="${normalizedStatus}"`);
        return {
          id: order.order_number || order.order_id,
          order_id: order.order_id,
          order_number: order.order_number,
          customerEmail: order.customer_email || order.email,
          customerName: order.customer_name || order.name || order.customer_email,
          date: order.created_at ? new Date(order.created_at).getTime() : Date.now(),
          items: order.items || [],
          subtotal: parseFloat(order.subtotal) || 0,
          shipping: parseFloat(order.shipping) || 0,
          discount: parseFloat(order.discount) || 0,
          total: parseFloat(order.total) || 0,
          status: normalizedStatus,
          shipping_address: order.shipping_address || null
        };
      });
      cachedOrders = transformedOrders;
      lastFetchTime = Date.now();
      console.log('Cache updated. Transformed orders:', transformedOrders.map(o => ({
        order_number: o.order_number,
        status: o.status
      })));
      const tbody = document.getElementById('orders-table-body');
      if (tbody) {
        if (transformedOrders.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No orders found</td></tr>';
        } else {
          tbody.innerHTML = transformedOrders.map((order) => {
            const itemsCount = order.items ? order.items.length : 0;
            const total = parseFloat(order.total) || 0;
            const status = (order.status || 'pending').toLowerCase().trim();
            const orderId = order.order_id || order.order_number || order.id || `ORD-${Date.now()}`;
            const orderNumber = order.order_number || orderId;
            const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1);
            const customerName = (order.customerName || order.customerEmail || 'N/A').replace(/'/g, "\\'");
            const safeOrderId = String(order.order_id || orderId).replace(/'/g, "\\'");
            console.log(`Rendering order ${orderNumber} (ID: ${order.order_id}): status="${status}"`);
            return `
              <tr>
                <td>${orderNumber}</td>
                <td>${order.customerName || order.customerEmail || 'N/A'}</td>
                <td>${formatDate(order.date || order.created_at)}</td>
                <td>${itemsCount} item(s)</td>
                <td>$${total.toFixed(2)}</td>
                <td><span class="admin-status admin-status--${status}">${statusDisplay}</span></td>
                <td>
                  <div class="admin-table__actions">
                    <button class="admin-table__btn admin-table__btn--edit" onclick="viewOrder('${safeOrderId}')">View</button>
                    ${status !== 'completed' ? `<button class="admin-table__btn admin-table__btn--delete" onclick="updateOrderStatus('${safeOrderId}', 'completed')">Complete</button>` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('');
        }
      }
      alert(`Order status updated to "${normalizedStatus}" successfully!`);
      return;
    } catch (error) {
      console.error('Error updating order status via API:', error);
      alert(`Error updating order status: ${error.message || 'Unknown error'}`);
    }
  }
  if (order && order.customerEmail) {
    const userOrders = JSON.parse(localStorage.getItem(`orders_${order.customerEmail}`) || '[]');
    const updatedOrders = userOrders.map(o => {
      if (o.id === orderId || o.order_number === orderId || String(o.id) === String(orderId)) {
        const normalizedStatus = newStatus.toLowerCase();
        return { ...o, status: normalizedStatus };
      }
      return o;
    });
    localStorage.setItem(`orders_${order.customerEmail}`, JSON.stringify(updatedOrders));
    await renderOrders();
    alert('Order status updated!');
  } else {
    alert('Could not update order: customer email not found');
  }
}
document.addEventListener('DOMContentLoaded', () => {
  renderOrders();
  const refreshBtn = document.getElementById('refresh-orders-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      cachedOrders = [];
      lastFetchTime = 0;
      await renderOrders();
    });
  }
  setInterval(async () => {
    cachedOrders = [];
    lastFetchTime = 0;
    await renderOrders();
  }, 10000);
});
