// Admin products CRUD functionality

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

async function loadProductsData() {
  try {
    // Try to load from API first
    if (typeof window !== 'undefined' && window.apiClient) {
      try {
        const apiProducts = await window.apiClient.getProducts();
        
        // Transform API products to match frontend format
        const transformedProducts = apiProducts.map(product => {
          // Map category slug to form category name
          const categorySlugMap = {
            'suitcases': 'suitcases',
            'carry-ons': 'carry-ons',
            'luggage-sets': 'luggage sets',
            'kids-luggage': "kids' luggage"
          };
          
          const categorySlug = product.category_slug || '';
          const categoryName = categorySlugMap[categorySlug] || product.category_name || categorySlug;
          
          return {
            id: product.product_code || String(product.product_id),
            product_id: product.product_id,
            name: product.name,
            category: categoryName,
            category_slug: categorySlug,
            category_name: product.category_name,
            price: parseFloat(product.price),
            stock: product.stock || 0,
            description: product.description,
            imageUrl: product.image_url || null,
            image_url: product.image_url || null,
            color: product.color,
            size: product.size,
            salesStatus: product.sales_status === 1 || product.sales_status === true,
            rating: product.rating || 0,
            popularity: product.popularity || 0
          };
        });
        
        console.log('Transformed API products:', transformedProducts);
        
        // Also load from JSON and localStorage for backward compatibility
        const basePath = getBasePath();
        let jsonProducts = [];
        try {
          const response = await fetch(`${basePath}assets/data.json`);
          if (response.ok) {
            const data = await response.json();
            jsonProducts = data.data || [];
          }
        } catch (e) {
          console.log('Could not load JSON products:', e);
        }
        
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
        
        // Merge: API products first, then JSON, then localStorage
        const productsMap = new Map();
        
        // Add API products (highest priority)
        transformedProducts.forEach(product => {
          productsMap.set(product.id, product);
        });
        
        // Add JSON products (except deleted ones and those already in API)
        jsonProducts.forEach(product => {
          if (!deletedProducts.includes(product.id) && !productsMap.has(product.id)) {
            productsMap.set(product.id, product);
          }
        });
        
        // Add localStorage products (except those already in API)
        adminProducts.forEach(product => {
          if (!productsMap.has(product.id)) {
            productsMap.set(product.id, product);
          }
        });
        
        // Convert to array and sort: admin products first, then JSON products
        const allProducts = Array.from(productsMap.values());
        
        // Sort: admin products (those with IDs starting with ADM or not in original JSON) first
        const adminProductIds = new Set(adminProducts.map(p => p.id));
        const jsonProductIds = new Set(jsonProducts.map(p => p.id));
        
        allProducts.sort((a, b) => {
          const aIsAdmin = adminProductIds.has(a.id) && !jsonProductIds.has(a.id);
          const bIsAdmin = adminProductIds.has(b.id) && !jsonProductIds.has(b.id);
          
          if (aIsAdmin && !bIsAdmin) return -1;
          if (!aIsAdmin && bIsAdmin) return 1;
          return 0;
        });
        
        return allProducts;
      } catch (apiError) {
        console.log('Could not load products from API, falling back to JSON/localStorage:', apiError);
        // Fall through to JSON/localStorage
      }
    }
    
    // Fallback to JSON and localStorage
    const basePath = getBasePath();
    const response = await fetch(`${basePath}assets/data.json`);
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
    
    // Convert to array and sort: admin products first, then JSON products
    const allProducts = Array.from(productsMap.values());
    
    // Sort: admin products (those with IDs starting with ADM or not in original JSON) first
    const adminProductIds = new Set(adminProducts.map(p => p.id));
    const jsonProductIds = new Set(jsonProducts.map(p => p.id));
    
    allProducts.sort((a, b) => {
      const aIsAdmin = adminProductIds.has(a.id) && !jsonProductIds.has(a.id);
      const bIsAdmin = adminProductIds.has(b.id) && !jsonProductIds.has(b.id);
      
      if (aIsAdmin && !bIsAdmin) return -1;
      if (!aIsAdmin && bIsAdmin) return 1;
      return 0;
    });
    
    return allProducts;
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to localStorage only
    return JSON.parse(localStorage.getItem('adminProducts') || '[]');
  }
}

function getLocalStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
}

function getLocalStorageSizeMB() {
  return (getLocalStorageSize() / 1024 / 1024).toFixed(2);
}

function saveAdminProducts(products) {
  try {
    // Check current storage usage
    const currentSize = getLocalStorageSizeMB();
    console.log('Current localStorage size:', currentSize, 'MB');
    
    const data = JSON.stringify(products);
    const sizeInMB = new Blob([data]).size / 1024 / 1024;
    console.log('New data size:', sizeInMB.toFixed(2), 'MB');
    
    // localStorage limit is usually ~5-10MB
    if (parseFloat(currentSize) > 4) {
      console.warn('localStorage is getting full!');
    }
    
    localStorage.setItem('adminProducts', data);
    return true;
  } catch (error) {
    console.error('Error saving admin products:', error);
    if (error.name === 'QuotaExceededError') {
      const currentSize = getLocalStorageSizeMB();
      
      // Try to automatically clear old base64 images
      const adminProducts = getAdminProducts();
      let cleared = 0;
      adminProducts.forEach(product => {
        if (product.imageUrl && product.imageUrl.startsWith('data:image/')) {
          product.imageUrl = 'assets/images/suitcases/catalog-blue-suitcase.png';
          cleared++;
        }
      });
      
      if (cleared > 0) {
        // Try to save again after clearing images
        try {
          const clearedData = JSON.stringify(adminProducts);
          localStorage.setItem('adminProducts', clearedData);
          alert(`Автоматически очищено ${cleared} изображений для освобождения места. Продукт сохранен.`);
          return true;
        } catch (e) {
          console.error('Still failed after clearing images:', e);
        }
      }
      
      const message = `Ошибка: Недостаточно места в хранилище браузера (использовано: ${currentSize}MB).\n\n` +
        `Попробуйте:\n` +
        `1. Использовать URL изображений вместо загрузки файлов\n` +
        `2. Удалить старые продукты\n` +
        `3. Очистить localStorage: localStorage.clear()`;
      alert(message);
      return false;
    }
    return false;
  }
}

function getAdminProducts() {
  try {
    return JSON.parse(localStorage.getItem('adminProducts') || '[]');
  } catch (error) {
    return [];
  }
}

function getCategoryPrefix(category) {
  const prefixes = {
    'suitcases': 'SU',
    'carry-ons': 'CO',
    'luggage sets': 'SET',
    "kids' luggage": 'KL',
    'kids luggage': 'KL'
  };
  return prefixes[category?.toLowerCase()] || 'PR';
}

async function generateProductId(category) {
  try {
    const prefix = getCategoryPrefix(category);
    
    // Load products from API first
    let apiProducts = [];
    if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
      try {
        apiProducts = await window.apiClient.getProducts();
        console.log('Loaded products from API for ID generation:', apiProducts.length);
      } catch (e) {
        console.log('Could not load products from API for ID generation:', e);
      }
    }
    
    // Load both JSON products and admin products separately to get all IDs
    const basePath = getBasePath();
    let jsonProducts = [];
    try {
      const response = await fetch(`${basePath}assets/data.json`);
      if (response.ok) {
        const data = await response.json();
        jsonProducts = data.data || [];
      }
    } catch (e) {
      console.error('Error loading JSON:', e);
    }
    
    const adminProducts = getAdminProducts();
    
    // Combine all products to check all IDs
    // Extract product_code from API products
    const apiProductCodes = apiProducts.map(p => p.product_code || p.id);
    const jsonProductIds = jsonProducts.map(p => p.id);
    const adminProductIds = adminProducts.map(p => p.id);
    
    // Combine all IDs
    const allIds = [...apiProductCodes, ...jsonProductIds, ...adminProductIds];
    
    if (allIds.length === 0) {
      // If no products, start with 001
      return `${prefix}001`;
    }
    
    // Find all IDs with this prefix
    const matchingIds = allIds
      .filter(id => id && typeof id === 'string' && id.startsWith(prefix))
      .map(id => {
        const numPart = id.replace(prefix, '');
        const num = parseInt(numPart);
        return isNaN(num) ? 0 : num;
      });
    
    // Find next available number
    const maxNum = matchingIds.length > 0 ? Math.max(...matchingIds) : 0;
    const nextNum = maxNum + 1;
    
    // Format as 3-digit number (001, 002, etc.)
    const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
    console.log(`Generated new ID: ${newId} (max was ${maxNum}, checked ${allIds.length} products)`);
    
    // Double-check that this ID doesn't exist
    if (allIds.includes(newId)) {
      console.warn(`Generated ID ${newId} already exists, trying next number`);
      const nextNextNum = nextNum + 1;
      const nextNewId = `${prefix}${String(nextNextNum).padStart(3, '0')}`;
      console.log(`Using next ID: ${nextNewId}`);
      return nextNewId;
    }
    
    return newId;
  } catch (error) {
    console.error('Error generating product ID:', error);
    // Fallback to timestamp-based ID
    return `PR${Date.now().toString().slice(-6)}`;
  }
}

function getProductImageUrl(product) {
  const basePath = getBasePath();
  let imageUrl = product.imageUrl || product.image_url || '';
  
  // If it's a base64 image, return as is
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
  
  // If imageUrl is empty or null, return null (will show gray background)
  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }
  
  if (imageUrl && imageUrl.startsWith('assets/')) {
    imageUrl = `${basePath}${imageUrl}`;
  } else if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/') && !imageUrl.startsWith('data:')) {
    imageUrl = `${basePath}${imageUrl}`;
  }
  
  return imageUrl;
}

function formatCategory(category) {
  if (!category) return 'N/A';
  return category.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function renderProducts(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) {
    console.error('Table body not found!');
    return;
  }
  
  console.log('Rendering', products.length, 'products');
  console.log('Products to render:', products);
  
  if (products.length === 0) {
    console.warn('No products to render');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(product => {
    const imageUrl = getProductImageUrl(product);
    const category = formatCategory(product.category || product.category_name);
    const price = product.price || 0;
    const stock = product.stock !== undefined ? product.stock : 0;
    
    // If no image, use gray background placeholder
    const imageHTML = imageUrl 
      ? `<img src="${imageUrl}" alt="${product.name}" class="admin-table__image" onerror="this.style.background='#e0e0e0'; this.style.display='block'; this.style.width='60px'; this.style.height='60px'; this.alt='No image'; this.onerror=null;">`
      : `<div class="admin-table__image" style="background: #e0e0e0; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">No image</div>`;
    
    return `
      <tr>
        <td>${product.id || product.product_code || 'N/A'}</td>
        <td>
          ${imageHTML}
        </td>
        <td>${product.name || 'N/A'}</td>
        <td>${category}</td>
        <td>$${price.toFixed(2)}</td>
        <td>
          <div class="admin-stock-cell">
            <input type="number" 
                   class="admin-stock-input" 
                   value="${stock}" 
                   min="0"
                   data-product-id="${product.id}"
                   data-original-stock="${stock}">
            <button class="admin-stock-save" 
                    data-product-id="${product.id}" 
                    style="display: none; margin-left: 5px; padding: 4px 8px; font-size: 11px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Save
            </button>
          </div>
        </td>
        <td>
          <div class="admin-table__actions">
            <button class="admin-table__btn admin-table__btn--edit" data-action="edit" data-product-id="${product.id}">Edit</button>
            <button class="admin-table__btn admin-table__btn--delete" data-action="delete" data-product-id="${product.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  // Re-attach event listeners for dynamically created buttons
  attachEventListeners();
}

function attachEventListeners() {
  const editButtons = document.querySelectorAll('[data-action="edit"]');
  editButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      editProduct(productId);
    });
  });

  const deleteButtons = document.querySelectorAll('[data-action="delete"]');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      deleteProduct(productId);
    });
  });
  
  // Stock input listeners
  const stockInputs = document.querySelectorAll('.admin-stock-input');
  stockInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const productId = e.target.getAttribute('data-product-id');
      const originalStock = parseInt(e.target.getAttribute('data-original-stock'));
      const newStock = parseInt(e.target.value) || 0;
      
      if (newStock !== originalStock) {
        const saveBtn = document.querySelector(`.admin-stock-save[data-product-id="${productId}"]`);
        if (saveBtn) {
          saveBtn.style.display = 'inline-block';
        }
      } else {
        const saveBtn = document.querySelector(`.admin-stock-save[data-product-id="${productId}"]`);
        if (saveBtn) {
          saveBtn.style.display = 'none';
        }
      }
    });
  });
  
  // Stock save buttons
  const stockSaveButtons = document.querySelectorAll('.admin-stock-save');
  stockSaveButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const productId = e.target.getAttribute('data-product-id');
      const input = document.querySelector(`.admin-stock-input[data-product-id="${productId}"]`);
      const newStock = parseInt(input.value) || 0;
      
      if (newStock < 0) {
        alert('Stock cannot be negative');
        return;
      }
      
      await updateProductStock(productId, newStock);
      e.target.style.display = 'none';
      input.setAttribute('data-original-stock', newStock);
    });
  });
}

async function updateProductStock(productId, newStock) {
  try {
    const adminProducts = getAdminProducts();
    const allProducts = await loadProductsData();
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
      alert('Product not found');
      return;
    }
  
    // Check if product is in admin products
    const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
    
    if (adminProductIndex > -1) {
      // Update existing admin product
      adminProducts[adminProductIndex].stock = newStock;
    } else {
      // Product from JSON, create admin version with updated stock
      const adminProduct = {
        ...product,
        stock: newStock
      };
      adminProducts.push(adminProduct);
    }
    
    saveAdminProducts(adminProducts);
    
    // Update the input's original value
    const input = document.querySelector(`.admin-stock-input[data-product-id="${productId}"]`);
    if (input) {
      input.setAttribute('data-original-stock', newStock);
    }
    
    // Show success message
    const saveBtn = document.querySelector(`.admin-stock-save[data-product-id="${productId}"]`);
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.style.background = '#4CAF50';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.display = 'none';
      }, 1000);
    }
  } catch (error) {
    alert('Error updating stock: ' + error.message);
  }
}

async function editProduct(productId) {
  const products = await loadProductsData();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    alert('Product not found');
    return;
  }
  
  const modalTitle = document.getElementById('modal-title');
  const productForm = document.getElementById('product-form');
  const productModal = document.getElementById('product-modal');
  
  modalTitle.textContent = 'Edit Product';
  
  // Populate form
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-stock').value = product.stock !== undefined ? product.stock : 0;
  document.getElementById('product-description').value = product.description || '';
  
  // Handle image - check if it's base64 or URL
  const imageUrl = product.imageUrl || '';
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const imageFileInput = document.getElementById('product-image-file');
  
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    // It's a base64 image
    if (previewImg) previewImg.src = imageUrl;
    if (imagePreview) imagePreview.style.display = 'block';
    if (imageFileInput) imageFileInput.dataset.base64 = imageUrl;
  } else {
    // No image or URL - clear preview
    if (imagePreview) imagePreview.style.display = 'none';
    if (imageFileInput) {
      imageFileInput.value = '';
      delete imageFileInput.dataset.base64;
    }
  }
  
  // Store product ID for update
  productForm.dataset.productId = productId;
  
  productModal.style.display = 'flex';
}

async function deleteProduct(productId) {
  const adminProducts = getAdminProducts();
  const isAdminProduct = adminProducts.findIndex(p => p.id === productId) > -1;
  
  const message = isAdminProduct 
    ? 'Are you sure you want to permanently delete this product? This action cannot be undone.'
    : 'This product is from the original catalog. It will be hidden from the admin panel, but can be restored later. Continue?';
  
  if (confirm(message)) {
    try {
      // Try to delete via API first
      if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
        try {
          // Find product_id from productId (could be product_code)
          const allProducts = await loadProductsData();
          const existingProduct = allProducts.find(p => p.id === productId || p.product_code === productId);
          
          if (existingProduct && existingProduct.product_id) {
            await window.apiClient.deleteProduct(existingProduct.product_id);
            console.log('Product deleted via API:', existingProduct.product_id);
            
            // Also remove from localStorage
            const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
            if (adminProductIndex > -1) {
              adminProducts.splice(adminProductIndex, 1);
              saveAdminProducts(adminProducts);
            }
            
            // Also remove from deletedProducts if it was there
            const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
            const deletedIndex = deletedProducts.indexOf(productId);
            if (deletedIndex > -1) {
              deletedProducts.splice(deletedIndex, 1);
              localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
            }
            
            await loadAndRenderProducts();
            
            // Update admin statistics if function is available
            if (typeof window !== 'undefined' && window.updateAdminStatistics) {
              window.updateAdminStatistics();
            }
            
            return;
          } else {
            console.log('Product not found in API, falling back to localStorage');
          }
        } catch (apiError) {
          console.error('Error deleting product via API:', apiError);
          alert(`Error deleting product via API: ${apiError.message || 'Unknown error'}. Falling back to localStorage.`);
          // Fall through to localStorage deletion
        }
      }
      
      // Fallback to localStorage deletion
      const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
      
      if (adminProductIndex > -1) {
        // Remove from admin products - permanent deletion
        adminProducts.splice(adminProductIndex, 1);
        saveAdminProducts(adminProducts);
        
        // Also remove from deletedProducts if it was there
        const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
        const deletedIndex = deletedProducts.indexOf(productId);
        if (deletedIndex > -1) {
          deletedProducts.splice(deletedIndex, 1);
          localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
        }
        
        alert('Product deleted permanently!');
        await loadAndRenderProducts();
      } else {
        // Product is from JSON, mark as deleted (hidden)
        const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
        if (!deletedProducts.includes(productId)) {
          deletedProducts.push(productId);
          localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
        }
        await loadAndRenderProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product: ' + error.message);
    }
  }
}

async function loadAndRenderProducts() {
  try {
    console.log('Loading and rendering products...');
    const products = await loadProductsData();
    console.log('Loaded products:', products.length);
    console.log('Products data:', products);
    
    if (products.length === 0) {
      console.warn('No products found!');
    }
    
    renderProducts(products);
    console.log('Products rendered');
  } catch (error) {
    console.error('Error in loadAndRenderProducts:', error);
    console.error('Error stack:', error.stack);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const closeModal = document.getElementById('close-modal');
  const cancelForm = document.getElementById('cancel-form');
  const productForm = document.getElementById('product-form');
  const modalTitle = document.getElementById('modal-title');
  
  // Load and render all products
  loadAndRenderProducts();

  // Open modal for adding product
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      modalTitle.textContent = 'Add New Product';
      productForm.reset();
      delete productForm.dataset.productId; // Clear product ID for new product
      productModal.style.display = 'flex';
    });
  }

  // Close modal
  function closeProductModal() {
    productModal.style.display = 'none';
    productForm.reset();
    // Clear image preview
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const imageFileInput = document.getElementById('product-image-file');
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (imageFileInput) imageFileInput.value = '';
  }
  
  // Image file upload handler
  const imageFileInput = document.getElementById('product-image-file');
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const removeImageBtn = document.getElementById('remove-image-btn');
  
  if (imageFileInput) {
    imageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file');
          e.target.value = '';
          return;
        }
        
        // Check file size (limit to 2MB before compression)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
          alert('Изображение слишком большое (максимум 2MB). Пожалуйста, используйте изображение меньшего размера или введите URL.');
          e.target.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // Calculate optimal size to keep under ~100KB after compression
            // Target: max 400x400px for product thumbnails (enough for admin panel)
            const maxWidth = 400;
            const maxHeight = 400;
            let width = img.width;
            let height = img.height;
            
            // Calculate new dimensions maintaining aspect ratio
            if (width > height) {
              if (width > maxWidth) {
                height = Math.round(height * (maxWidth / width));
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round(width * (maxHeight / height));
                height = maxHeight;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Better quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with lower quality (0.6) to save space
            // This should result in ~50-100KB images
            const base64Image = canvas.toDataURL('image/jpeg', 0.6);
            
            const sizeKB = (base64Image.length * 3 / 4) / 1024;
            console.log('Compressed image size:', sizeKB.toFixed(2), 'KB');
            
            if (sizeKB > 150) {
              console.warn('Image is still large after compression');
            }
            
            previewImg.src = base64Image;
            imagePreview.style.display = 'block';
            imageFileInput.dataset.base64 = base64Image;
          };
          img.onerror = () => {
            alert('Ошибка загрузки изображения');
            e.target.value = '';
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
      if (imageFileInput) {
        imageFileInput.value = '';
        delete imageFileInput.dataset.base64;
      }
      if (imagePreview) imagePreview.style.display = 'none';
      if (previewImg) previewImg.src = '';
    });
  }
  
  // URL input removed - no need to handle URL input events

  if (closeModal) {
    closeModal.addEventListener('click', closeProductModal);
  }

  if (cancelForm) {
    cancelForm.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    const overlay = productModal.querySelector('.admin-modal__overlay');
    if (overlay) {
      overlay.addEventListener('click', closeProductModal);
    }
  }

  // Form submission
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const productId = productForm.dataset.productId;
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const price = parseFloat(document.getElementById('product-price').value);
      const stock = parseInt(document.getElementById('product-stock').value);
      const description = document.getElementById('product-description').value.trim();
      
      // Get image - only from uploaded file
      let imageUrl = '';
      const imageFileInput = document.getElementById('product-image-file');
      if (imageFileInput && imageFileInput.dataset.base64) {
        // Use uploaded image (base64)
        imageUrl = imageFileInput.dataset.base64;
      }
      // URL input removed - only file upload is available
      
      // Validation
      if (!name || !category || !price || price <= 0 || stock < 0) {
        alert('Please fill in all required fields with valid values');
        return;
      }
      
      try {
        console.log('Form submitted, productId:', productId);
        const adminProducts = getAdminProducts();
        console.log('Current admin products:', adminProducts);
        
        // Generate ID if creating new product
        let finalProductId = productId;
        if (!finalProductId) {
          console.log('Generating new ID for category:', category);
          finalProductId = await generateProductId(category);
          console.log('Generated ID:', finalProductId);
          if (!finalProductId) {
            alert('Error generating product ID');
            return;
          }
        }
        
        // Try to save via API first
        if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
          try {
            // Map category from form to database slug
            const categorySlugMap = {
              'suitcases': 'suitcases',
              'carry-ons': 'carry-ons',
              'luggage sets': 'luggage-sets',
              "kids' luggage": 'kids-luggage',
              'kids luggage': 'kids-luggage'
            };
            
            const categorySlug = categorySlugMap[category] || category;
            
            // Get category_id from category slug
            const categories = await window.apiClient.getCategories();
            const categoryObj = categories.find(c => c.category_slug === categorySlug);
            
            if (!categoryObj) {
              throw new Error(`Category "${category}" (slug: "${categorySlug}") not found`);
            }
            
            const productData = {
              product_code: finalProductId,
              name: name,
              description: description || null,
              price: price,
              stock: stock,
              image_url: imageUrl || null, // null if no image
              color: null,
              size: null,
              category_id: categoryObj.category_id,
              sales_status: true,
              rating: 0,
              popularity: 0
            };
            
            if (productId) {
              // Update existing product
              // Find product_id from productId (could be product_code)
              const allProducts = await loadProductsData();
              const existingProduct = allProducts.find(p => p.id === productId || p.product_code === productId);
              
              if (existingProduct && existingProduct.product_id) {
                await window.apiClient.updateProduct(existingProduct.product_id, productData);
                alert('Product updated successfully!');
              } else {
                throw new Error('Product not found for update');
              }
            } else {
              // Create new product
              await window.apiClient.createProduct(productData);
              alert('Product created successfully!');
            }
            
            closeProductModal();
            
            // Force reload
            console.log('Reloading products...');
            await loadAndRenderProducts();
            
            // Update admin statistics if function is available
            if (typeof window !== 'undefined' && window.updateAdminStatistics) {
              window.updateAdminStatistics();
            }
            
            return;
          } catch (error) {
            console.error('Error saving product via API:', error);
            alert(`Error saving product via API: ${error.message || 'Unknown error'}. Falling back to localStorage.`);
            // Fall through to localStorage save
          }
        }
        
        // Fallback to localStorage
        const newProduct = {
          id: finalProductId,
          name: name,
          category: category,
          price: price,
          stock: stock,
          description: description,
          imageUrl: imageUrl || null, // null if no image (will show gray background)
          salesStatus: true,
          rating: 0,
          popularity: 0,
          blocks: []
        };
        
        console.log('New product object:', newProduct);
        
        if (productId) {
          // Edit existing product
          const index = adminProducts.findIndex(p => p.id === productId);
          if (index > -1) {
            adminProducts[index] = { ...adminProducts[index], ...newProduct };
            alert('Product updated successfully!');
          } else {
            // Product from JSON, add as new admin product at the beginning
            adminProducts.unshift(newProduct);
            alert('Product updated successfully!');
          }
        } else {
          // Add new product at the beginning
          adminProducts.unshift(newProduct);
          alert('Product created successfully!');
        }
        
        console.log('Products array before save:', adminProducts.length, 'products');
        const beforeCount = adminProducts.length;
        
        const saveSuccess = saveAdminProducts(adminProducts);
        if (!saveSuccess) {
          // Save failed due to quota or other error
          return;
        }
        console.log('Products saved to localStorage');
        
        // Verify save immediately
        const saved = getAdminProducts();
        console.log('Verified saved products:', saved.length, 'products');
        
        if (saved.length !== beforeCount) {
          console.error('Save verification failed! Expected:', beforeCount, 'Got:', saved.length);
          alert('Ошибка: Продукт не был сохранен. Возможно, не хватает места в хранилище. Попробуйте удалить старые продукты или использовать URL изображения вместо загрузки файла.');
          return;
        }
        
        closeProductModal();
        
        // Force reload
        console.log('Reloading products...');
        await loadAndRenderProducts();
        
        // Update admin statistics if function is available
        if (typeof window !== 'undefined' && window.updateAdminStatistics) {
          window.updateAdminStatistics();
        }
        
        // Double check after reload
        const finalProducts = await loadProductsData();
        console.log('Final product count after reload:', finalProducts.length);
        
        // Check if new product is in the list
        const productExists = finalProducts.some(p => p.id === finalProductId);
        if (!productExists) {
          console.error('Product not found after reload! ID:', finalProductId);
          alert('Warning: Product was saved but not found in the list. Please refresh the page.');
        } else {
          console.log('Product successfully added and visible!');
        }
      } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
      }
    });
  }
});

