function getBasePath() {
  const path = window.location.pathname;
  const isSubPage = path.includes('/html/');
  const isGitHubPages = path.includes('/web-2-course/');
  const repoBase = isGitHubPages ? '/web-2-course' : '';
  const srcPath = `${repoBase}/src`;
  const slash = '/';
  return `${srcPath}${slash}`;
}
async function loadProductsData() {
  try {
    if (typeof window !== 'undefined' && window.apiClient) {
      try {
        const apiProducts = await window.apiClient.getProducts();
        const transformedProducts = apiProducts.map(product => {
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
        const productsMap = new Map();
        transformedProducts.forEach(product => {
          productsMap.set(product.id, product);
        });
        jsonProducts.forEach(product => {
          if (!deletedProducts.includes(product.id) && !productsMap.has(product.id)) {
            productsMap.set(product.id, product);
          }
        });
        adminProducts.forEach(product => {
          if (!productsMap.has(product.id)) {
            productsMap.set(product.id, product);
          }
        });
        const allProducts = Array.from(productsMap.values());
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
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    const productsMap = new Map();
    jsonProducts.forEach(product => {
      if (!deletedProducts.includes(product.id)) {
        productsMap.set(product.id, product);
      }
    });
    adminProducts.forEach(product => {
      productsMap.set(product.id, product);
    });
    const allProducts = Array.from(productsMap.values());
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
    const currentSize = getLocalStorageSizeMB();
    console.log('Current localStorage size:', currentSize, 'MB');
    const data = JSON.stringify(products);
    const sizeInMB = new Blob([data]).size / 1024 / 1024;
    console.log('New data size:', sizeInMB.toFixed(2), 'MB');
    if (parseFloat(currentSize) > 4) {
      console.warn('localStorage is getting full!');
    }
    localStorage.setItem('adminProducts', data);
    return true;
  } catch (error) {
    console.error('Error saving admin products:', error);
    if (error.name === 'QuotaExceededError') {
      const currentSize = getLocalStorageSizeMB();
      const adminProducts = getAdminProducts();
      let cleared = 0;
      adminProducts.forEach(product => {
        if (product.imageUrl && product.imageUrl.startsWith('data:image/')) {
          product.imageUrl = 'assets/images/suitcases/catalog-blue-suitcase.png';
          cleared++;
        }
      });
      if (cleared > 0) {
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
async function generateProductId(category, providedProducts = null) {
  try {
    const prefix = getCategoryPrefix(category);
    let apiProducts = providedProducts || [];
    if (apiProducts.length === 0 && typeof window !== 'undefined' && window.apiClient) {
      try {
        const timestamp = Date.now();
        apiProducts = await window.apiClient.getProducts({ _t: timestamp });
        console.log('Loaded products from API for ID generation:', apiProducts.length);
      } catch (e) {
        console.log('Could not load products from API for ID generation:', e);
      }
    }
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
    const apiProductCodes = apiProducts.map(p => p.product_code || p.id);
    const jsonProductIds = jsonProducts.map(p => p.id);
    const adminProductIds = adminProducts.map(p => p.id);
    const allIds = [...apiProductCodes, ...jsonProductIds, ...adminProductIds];
    if (allIds.length === 0) {
      return `${prefix}001`;
    }
    const matchingIds = allIds
      .filter(id => id && typeof id === 'string' && id.startsWith(prefix))
      .map(id => {
        const numPart = id.replace(prefix, '');
        const num = parseInt(numPart);
        return isNaN(num) ? 0 : num;
      })
      .filter(num => num > 0); 
    const usedNumbers = new Set(matchingIds);
    const sortedUsed = Array.from(matchingIds).sort((a, b) => a - b);
    console.log(`Used numbers for prefix ${prefix}:`, sortedUsed.slice(-10)); 
    let nextNum = 1;
    if (matchingIds.length > 0) {
      const maxNum = Math.max(...matchingIds);
      nextNum = maxNum + 1;
      let found = false;
      for (let i = maxNum + 1; i <= maxNum + 50; i++) {
        if (!usedNumbers.has(i)) {
          nextNum = i;
          found = true;
          break;
        }
      }
      if (!found) {
        nextNum = maxNum + 1;
      }
    }
    const newId = `${prefix}${String(nextNum).padStart(3, '0')}`;
    if (allIds.includes(newId)) {
      console.warn(`Generated ID ${newId} already exists in allIds, finding next available...`);
      let candidateNum = nextNum + 1;
      let candidateId = `${prefix}${String(candidateNum).padStart(3, '0')}`;
      while (allIds.includes(candidateId) && candidateNum < 999) {
        candidateNum++;
        candidateId = `${prefix}${String(candidateNum).padStart(3, '0')}`;
      }
      if (candidateNum >= 999) {
        return `PR${Date.now().toString().slice(-6)}`;
      }
      console.log(`Using next available ID: ${candidateId}`);
      return candidateId;
    }
    console.log(`Generated new ID: ${newId} (max was ${matchingIds.length > 0 ? Math.max(...matchingIds) : 0}, checked ${allIds.length} products, used numbers: ${matchingIds.length})`);
    return newId;
  } catch (error) {
    console.error('Error generating product ID:', error);
    return `PR${Date.now().toString().slice(-6)}`;
  }
}
function getProductImageUrl(product) {
  const basePath = getBasePath();
  let imageUrl = product.imageUrl || product.image_url || '';
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    return imageUrl;
  }
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
    const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
    if (adminProductIndex > -1) {
      adminProducts[adminProductIndex].stock = newStock;
    } else {
      const adminProduct = {
        ...product,
        stock: newStock
      };
      adminProducts.push(adminProduct);
    }
    saveAdminProducts(adminProducts);
    const input = document.querySelector(`.admin-stock-input[data-product-id="${productId}"]`);
    if (input) {
      input.setAttribute('data-original-stock', newStock);
    }
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
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-stock').value = product.stock !== undefined ? product.stock : 0;
  document.getElementById('product-description').value = product.description || '';
  const imageUrl = product.imageUrl || '';
  const imagePreview = document.getElementById('image-preview');
  const previewImg = document.getElementById('preview-img');
  const imageFileInput = document.getElementById('product-image-file');
  if (imageUrl && imageUrl.startsWith('data:image/')) {
    if (previewImg) previewImg.src = imageUrl;
    if (imagePreview) imagePreview.style.display = 'block';
    if (imageFileInput) imageFileInput.dataset.base64 = imageUrl;
  } else {
    if (imagePreview) imagePreview.style.display = 'none';
    if (imageFileInput) {
      imageFileInput.value = '';
      delete imageFileInput.dataset.base64;
    }
  }
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
      if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
        try {
          const allProducts = await loadProductsData();
          const existingProduct = allProducts.find(p => p.id === productId || p.product_code === productId);
          if (existingProduct && existingProduct.product_id) {
            await window.apiClient.deleteProduct(existingProduct.product_id);
            console.log('Product deleted via API:', existingProduct.product_id);
            const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
            if (adminProductIndex > -1) {
              adminProducts.splice(adminProductIndex, 1);
              saveAdminProducts(adminProducts);
            }
            const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
            const deletedIndex = deletedProducts.indexOf(productId);
            if (deletedIndex > -1) {
              deletedProducts.splice(deletedIndex, 1);
              localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
            }
            await loadAndRenderProducts();
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
        }
      }
      const adminProductIndex = adminProducts.findIndex(p => p.id === productId);
      if (adminProductIndex > -1) {
        adminProducts.splice(adminProductIndex, 1);
        saveAdminProducts(adminProducts);
        const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
        const deletedIndex = deletedProducts.indexOf(productId);
        if (deletedIndex > -1) {
          deletedProducts.splice(deletedIndex, 1);
          localStorage.setItem('deletedProducts', JSON.stringify(deletedProducts));
        }
        alert('Product deleted permanently!');
        await loadAndRenderProducts();
      } else {
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
  loadAndRenderProducts();
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      modalTitle.textContent = 'Add New Product';
      productForm.reset();
      delete productForm.dataset.productId; 
      productModal.style.display = 'flex';
    });
  }
  function closeProductModal() {
    productModal.style.display = 'none';
    productForm.reset();
    const preview = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const imageFileInput = document.getElementById('product-image-file');
    if (preview) preview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (imageFileInput) imageFileInput.value = '';
  }
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
        const maxSize = 2 * 1024 * 1024; 
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
            const maxWidth = 400;
            const maxHeight = 400;
            let width = img.width;
            let height = img.height;
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
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
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
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const productId = productForm.dataset.productId;
      const name = document.getElementById('product-name').value.trim();
      const category = document.getElementById('product-category').value;
      const price = parseFloat(document.getElementById('product-price').value);
      const stock = parseInt(document.getElementById('product-stock').value);
      const description = document.getElementById('product-description').value.trim();
      let imageUrl = '';
      const imageFileInput = document.getElementById('product-image-file');
      if (imageFileInput && imageFileInput.dataset.base64) {
        imageUrl = imageFileInput.dataset.base64;
      }
      if (!name || !category || !price || price <= 0 || stock < 0) {
        alert('Please fill in all required fields with valid values');
        return;
      }
      try {
        console.log('Form submitted, productId:', productId);
        const adminProducts = getAdminProducts();
        console.log('Current admin products:', adminProducts);
        let finalProductId = productId;
        if (!finalProductId) {
          console.log('Generating new ID for category:', category);
          let freshProducts = [];
          if (typeof window !== 'undefined' && window.apiClient) {
            try {
              const timestamp = Date.now();
              freshProducts = await window.apiClient.getProducts({ _t: timestamp });
              console.log('Loaded fresh products for initial ID generation:', freshProducts.length);
            } catch (e) {
              console.log('Could not load fresh products:', e);
            }
          }
          finalProductId = await generateProductId(category, freshProducts);
          console.log('Generated ID:', finalProductId);
          if (!finalProductId) {
            alert('Error generating product ID');
            return;
          }
        }
        if (typeof window !== 'undefined' && window.apiClient && window.apiClient.isAuthenticated()) {
          try {
            const categorySlugMap = {
              'suitcases': 'suitcases',
              'carry-ons': 'carry-ons',
              'luggage sets': 'luggage-sets',
              "kids' luggage": 'kids-luggage',
              'kids luggage': 'kids-luggage'
            };
            const categorySlug = categorySlugMap[category] || category;
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
              image_url: imageUrl || null, 
              color: null,
              size: null,
              category_id: categoryObj.category_id,
              sales_status: true,
              rating: 0,
              popularity: 0
            };
            if (productId) {
              const allProducts = await loadProductsData();
              const existingProduct = allProducts.find(p => p.id === productId || p.product_code === productId);
              if (existingProduct && existingProduct.product_id) {
                await window.apiClient.updateProduct(existingProduct.product_id, productData);
                alert('Product updated successfully!');
              } else {
                throw new Error('Product not found for update');
              }
            } else {
              await window.apiClient.createProduct(productData);
              alert('Product created successfully!');
            }
            closeProductModal();
            console.log('Reloading products...');
            await loadAndRenderProducts();
            if (typeof window !== 'undefined' && window.updateAdminStatistics) {
              window.updateAdminStatistics();
            }
            return;
          } catch (error) {
            console.error('Error saving product via API:', error);
            const errorMessage = error.message || '';
            if (errorMessage.includes('Product code already exists') || error.status === 409) {
              try {
                console.log('Product code already exists, generating new code...');
                let retryCount = 0;
                const maxRetries = 5;
                let success = false;
                const prefix = getCategoryPrefix(category);
                let lastAttemptedNum = null;
                while (retryCount < maxRetries && !success) {
                  retryCount++;
                  console.log(`Retry attempt ${retryCount}/${maxRetries}`);
                  let latestProducts = [];
                  if (typeof window !== 'undefined' && window.apiClient) {
                    const timestamp = Date.now();
                    latestProducts = await window.apiClient.getProducts({ _t: timestamp });
                    console.log(`Reloaded ${latestProducts.length} products from API for retry ${retryCount}`);
                  }
                  if (lastAttemptedNum !== null) {
                    lastAttemptedNum++;
                    finalProductId = `${prefix}${String(lastAttemptedNum).padStart(3, '0')}`;
                    console.log(`Incremented code from previous attempt: ${finalProductId}`);
                  } else {
                    finalProductId = await generateProductId(category, latestProducts);
                    console.log(`Generated new product code (attempt ${retryCount}):`, finalProductId);
                    const numPart = finalProductId.replace(prefix, '');
                    lastAttemptedNum = parseInt(numPart);
                  }
                  const categories = await window.apiClient.getCategories();
                  const categorySlugMap = {
                    'suitcases': 'suitcases',
                    'carry-ons': 'carry-ons',
                    'luggage sets': 'luggage-sets',
                    "kids' luggage": 'kids-luggage',
                    'kids luggage': 'kids-luggage'
                  };
                  const categorySlug = categorySlugMap[category] || category;
                  const categoryObj = categories.find(c => c.category_slug === categorySlug);
                  if (!categoryObj) {
                    throw new Error(`Category "${category}" not found`);
                  }
                  const retryProductData = {
                    product_code: finalProductId,
                    name: name,
                    description: description || null,
                    price: price,
                    stock: stock,
                    image_url: imageUrl || null,
                    color: null,
                    size: null,
                    category_id: categoryObj.category_id,
                    sales_status: true,
                    rating: 0,
                    popularity: 0
                  };
                  try {
                    await window.apiClient.createProduct(retryProductData);
                    console.log('Product created successfully with code:', finalProductId);
                    alert('Product created successfully!');
                    closeProductModal();
                    await loadAndRenderProducts();
                    if (typeof window !== 'undefined' && window.updateAdminStatistics) {
                      window.updateAdminStatistics();
                    }
                    success = true;
                    return;
                  } catch (createError) {
                    const createErrorMessage = createError.message || '';
                    if (createErrorMessage.includes('Product code already exists') || createError.status === 409) {
                      console.log(`Code ${finalProductId} also exists (attempt ${retryCount}), will increment to ${lastAttemptedNum + 1}...`);
                      continue;
                    } else {
                      throw createError;
                    }
                  }
                }
                if (!success) {
                  throw new Error(`Could not generate unique product code after ${maxRetries} attempts`);
                }
              } catch (retryError) {
                console.error('Error on retry:', retryError);
                alert(`Error saving product via API: ${retryError.message || 'Unknown error'}. Falling back to localStorage.`);
              }
            } else {
              alert(`Error saving product via API: ${error.message || 'Unknown error'}. Falling back to localStorage.`);
            }
          }
        }
        const newProduct = {
          id: finalProductId,
          name: name,
          category: category,
          price: price,
          stock: stock,
          description: description,
          imageUrl: imageUrl || null, 
          salesStatus: true,
          rating: 0,
          popularity: 0,
          blocks: []
        };
        console.log('New product object:', newProduct);
        if (productId) {
          const index = adminProducts.findIndex(p => p.id === productId);
          if (index > -1) {
            adminProducts[index] = { ...adminProducts[index], ...newProduct };
            alert('Product updated successfully!');
          } else {
            adminProducts.unshift(newProduct);
            alert('Product updated successfully!');
          }
        } else {
          adminProducts.unshift(newProduct);
          alert('Product created successfully!');
        }
        console.log('Products array before save:', adminProducts.length, 'products');
        const beforeCount = adminProducts.length;
        const saveSuccess = saveAdminProducts(adminProducts);
        if (!saveSuccess) {
          return;
        }
        console.log('Products saved to localStorage');
        const saved = getAdminProducts();
        console.log('Verified saved products:', saved.length, 'products');
        if (saved.length !== beforeCount) {
          console.error('Save verification failed! Expected:', beforeCount, 'Got:', saved.length);
          alert('Ошибка: Продукт не был сохранен. Возможно, не хватает места в хранилище. Попробуйте удалить старые продукты или использовать URL изображения вместо загрузки файла.');
          return;
        }
        closeProductModal();
        console.log('Reloading products...');
        await loadAndRenderProducts();
        if (typeof window !== 'undefined' && window.updateAdminStatistics) {
          window.updateAdminStatistics();
        }
        const finalProducts = await loadProductsData();
        console.log('Final product count after reload:', finalProducts.length);
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
