const cartButton = document.querySelector('.cart');
const sidebar = document.querySelector('.order-sidebar');
const gridContainer = document.querySelector('.grid-container');

cartButton.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('show');
    gridContainer.classList.toggle('cart-open');
});

const receiptItems = document.querySelector('.receipt-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const discountEl = document.getElementById('discount');
const placeOrderBtn = document.getElementById('place-order');

let order = [];

document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const itemBox = btn.closest('.item');

        const name = itemBox.querySelector('.name').textContent;
        const price = parseFloat(
            itemBox.querySelector('.price').textContent.replace('$', '')
        );

        const imageEl = itemBox.querySelector('img');
        const imageSrc = imageEl ? imageEl.src : 'images/default.png';

        addItem(name, price, imageSrc);
    });
});

function addItem(name, price, imageSrc) {
    const existing = order.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        order.push({ name, price, qty: 1, image: imageSrc });
    }
    renderOrder();
}

function renderOrder() {
    if (order.length === 0) {
        receiptItems.innerHTML = "<p>No items added</p>";
        subtotalEl.textContent = "$0.00";
        taxEl.textContent = "$0.00";
        totalEl.textContent = "$0.00";
        return;
    }

    receiptItems.innerHTML = "";
    let subtotal = 0;

    order.forEach((item, index) => {
        const row = document.createElement('div');
        row.classList.add('receipt-row');
        row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="receipt-img">
      <span>${item.name}</span>
      <div class="qty-controls">
        <button class="decrease">-</button>
        <span>${item.qty}</span>
        <button class="increase">+</button>
      </div>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
    `;

        row.querySelector('.increase').addEventListener('click', () => {
            item.qty++;
            renderOrder();
        });
        row.querySelector('.decrease').addEventListener('click', () => {
            if (item.qty > 1) {
                item.qty--;
            } else {
                order.splice(index, 1);
            }
            renderOrder();
        });

        receiptItems.appendChild(row);
        subtotal += item.price * item.qty;
    });

    calculateTotals(subtotal);
}

discountEl.addEventListener('input', () => {
    const subtotal = order.reduce((sum, item) => sum + item.price * item.qty, 0);
    calculateTotals(subtotal);
});

function calculateTotals(subtotal) {
    let discount = parseFloat(discountEl.value) || 0;
    if (discount < 0 || discount > 100) discount = 0;

    const discountedSubtotal = subtotal - (subtotal * discount / 100);
    const tax = discountedSubtotal * 0.10;
    const total = discountedSubtotal + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

placeOrderBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('customer-name');
    const tableInput = document.getElementById('table-no');

    document.querySelectorAll('.error-msg').forEach(el => el.remove());

    let valid = true;

    if (!nameInput.value.trim()) {
        const error = document.createElement('div');
        error.className = 'error-msg';
        error.textContent = 'Customer name is required';
        nameInput.insertAdjacentElement('afterend', error);
        valid = false;
    }

    if (!tableInput.value) {
        const error = document.createElement('div');
        error.className = 'error-msg';
        error.textContent = 'Table number is required';
        tableInput.insertAdjacentElement('afterend', error);
        valid = false;
    }

    if (valid) {
        order = [];
        renderOrder();
        nameInput.value = "";
        tableInput.value = "";
        discountEl.value = "";
    }
});

const searchInput = document.querySelector('.search-input');
const productItems = document.querySelectorAll('.item');

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    productItems.forEach(item => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        if (name.includes(query)) {
            item.style.display = "grid";
        } else {
            item.style.display = "none";
        }
    });
});