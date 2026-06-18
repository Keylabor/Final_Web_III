let currentCategory = 'coffee';
let savedProducts = JSON.parse(localStorage.getItem('addedProducts')) || [];

function showCategory(selected) {
  currentCategory = selected;

  document.querySelectorAll('.product-list .item').forEach(item => {
    item.style.display = item.classList.contains(selected) ? '' : 'none';
  });

  document.querySelectorAll('.category-item').forEach(cat => {
    cat.classList.toggle('active', cat.dataset.cat === selected);
  });
}

function saveProducts() {
  localStorage.setItem('addedProducts', JSON.stringify(savedProducts));
}

function renderProduct(product) {
  const productItems = document.querySelector('.product-items');
  const item = document.createElement('div');

  item.className = `item ${product.category}`;

  item.innerHTML = `
    ${product.imageSrc ? `<img src="${product.imageSrc}" alt="${escapeHtml(product.name)}" class="item-image">` : ''}
    <div class="item-info">
      <span class="name">${escapeHtml(product.name)}</span>
      <span class="price">$${product.price}</span>
    </div>
    <div class="add-btn">+</div>
  `;

  productItems.appendChild(item);
  return item;
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

async function resizeImageFile(file) {
  const imageSrc = await readImageFile(file);

  return new Promise(resolve => {
    const image = new Image();

    image.addEventListener('load', () => {
      const maxSize = 700;
      const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/png'));
    });

    image.src = imageSrc;
  });
}

function addProduct() {
  const modal = document.createElement('div');
  modal.className = 'product-modal';

  modal.innerHTML = `
    <form class="product-form" novalidate>
      <div class="product-form-header">
        <h3>Add Product</h3>
        <button type="button" class="product-form-close" aria-label="Close">x</button>
      </div>

      <label>
        Category
        <select name="category" required>
          <option value="">Choose category</option>
          <option value="coffee">Coffee</option>
          <option value="tea">Tea</option>
          <option value="dessert">Dessert</option>
        </select>
      </label>

      <label>
        Product Name
        <input type="text" name="name" required>
      </label>

      <label>
        Price
        <input type="number" name="price" min="0.01" step="0.01" required>
      </label>

      <label>
        Product Image
        <input type="file" name="image" accept="image/*" required>
      </label>

      <p class="product-form-error"></p>

      <div class="product-form-actions">
        <button type="button" class="product-form-cancel">Cancel</button>
        <button type="submit">Add Item</button>
      </div>
    </form>
  `;

  document.body.appendChild(modal);

  const form = modal.querySelector('.product-form');
  const error = modal.querySelector('.product-form-error');
  const closeModal = () => modal.remove();

  modal.querySelector('.product-form-close').addEventListener('click', closeModal);
  modal.querySelector('.product-form-cancel').addEventListener('click', closeModal);

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const formData = new FormData(form);
    const category = formData.get('category');
    const name = formData.get('name').trim();
    const price = formData.get('price');
    const image = formData.get('image');

    if (!category || !name || !price || !image.name) {
      error.textContent = 'Please fill in every field.';
      return;
    }

    if (Number(price) <= 0) {
      error.textContent = 'Please enter a price greater than 0.';
      return;
    }

    const product = {
      category,
      name,
      price: Number(price).toFixed(2),
      imageSrc: await resizeImageFile(image)
    };

    savedProducts.push(product);
    const item = renderProduct(product);
    showCategory(product.category);
    item.scrollIntoView({ block: 'nearest' });

    try {
      saveProducts();
    } catch (error) {
      savedProducts.pop();
      console.error(error);
    }

    closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  savedProducts.forEach(renderProduct);
  showCategory('coffee');

  document.querySelector('.add-product button').addEventListener('click', addProduct);
});

document.querySelectorAll('.category-item').forEach(cat => {
  cat.addEventListener('click', () => {
    showCategory(cat.dataset.cat);
  });
});
