class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.attachEventListeners();
    }

    loadCart() {
        const saved = localStorage.getItem('florCart');
        return saved ? JSON.parse(saved) : [];
    }

    saveCart() {
        localStorage.setItem('florCart', JSON.stringify(this.items));
    }

    addItem(product) {
        const existingItem = this.items.find(item => 
            item.id === product.id && 
            item.safetyBox === product.safetyBox
        );

        if (existingItem) {
            existingItem.quantity += product.quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: product.quantity,
                safetyBox: product.safetyBox,
                safetyBoxPrice: product.safetyBoxPrice || 0
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item added to cart!');
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(index, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(index);
        } else {
            this.items[index].quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = parseFloat(item.price.replace(/[₱,]/g, ''));
            const safetyPrice = item.safetyBoxPrice || 0;
            return total + ((price + safetyPrice) * item.quantity);
        }, 0);
    }

    updateCartDisplay() {
        const cartItemsList = document.querySelector('.cart-items-list');
        const cartTotal = document.querySelector('.estimated-total-price');
        const cartIcon = document.querySelector('.header-icons .fa-shopping-bag');

        if (!cartItemsList) return;

        // Update cart icon badge
        if (cartIcon) {
            const badge = cartIcon.parentElement.querySelector('.cart-badge') || 
                document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = this.items.reduce((sum, item) => sum + item.quantity, 0);
            if (!cartIcon.parentElement.querySelector('.cart-badge')) {
                cartIcon.parentElement.appendChild(badge);
            }
        }

        // Update cart items display
        if (this.items.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        } else {
            cartItemsList.innerHTML = this.items.map((item, index) => {
                const itemPrice = parseFloat(item.price.replace(/[₱,]/g, ''));
                const safetyPrice = item.safetyBoxPrice || 0;
                const totalPrice = (itemPrice + safetyPrice) * item.quantity;

                return `
                    <div class="cart-item">
                        <div class="item-details">
                            <div class="item-image-box" style="background-image: url('${item.image}')"></div>
                            <div class="item-info">
                                <h4 class="item-name">${item.name}</h4>
                                <p class="item-price-original">${item.price}</p>
                                ${item.safetyBox ? `
                                    <p class="item-addon">Safety Box: With Safety Box</p>
                                    <p class="item-addon-price">(+₱${item.safetyBoxPrice})</p>
                                ` : ''}
                                <div class="cart-quantity-group">
                                    <div class="quantity-selector-cart">
                                        <button class="quantity-btn minus-btn" data-index="${index}">−</button>
                                        <input type="text" value="${item.quantity}" readonly>
                                        <button class="quantity-btn plus-btn" data-index="${index}">+</button>
                                    </div>
                                    <button class="item-remove-btn" data-index="${index}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p class="item-total-price">₱${totalPrice.toFixed(2)}</p>
                    </div>
                `;
            }).join('');
        }

        // Update total
        if (cartTotal) {
            cartTotal.innerHTML = `₱${this.getTotal().toFixed(2)} <span class="currency">PHP</span>`;
        }
    }

    attachEventListeners() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart-potm, .details')) {
                e.preventDefault();
                this.handleAddToCart(e.target);
            }

            // Quantity buttons
            if (e.target.matches('.minus-btn, .plus-btn')) {
                const index = parseInt(e.target.dataset.index);
                const change = e.target.matches('.plus-btn') ? 1 : -1;
                this.updateQuantity(index, this.items[index].quantity + change);
            }

            // Remove button
            if (e.target.matches('.item-remove-btn, .item-remove-btn *')) {
                const btn = e.target.closest('.item-remove-btn');
                if (btn) {
                    const index = parseInt(btn.dataset.index);
                    this.removeItem(index);
                }
            }
        });

        // Checkout button
        const checkoutBtn = document.querySelector('.checkout-button');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    alert('Your cart is empty!');
                    return;
                }
                window.location.href = 'pages/checkout.html';
            });
        }
    }

    handleAddToCart(button) {
        const productCard = button.closest('.product-card, .potm-container');
        if (!productCard) return;

        const product = {
            id: button.dataset.id || 'unknown',
            name: productCard.querySelector('.product-name, .product-name-lg')?.textContent || 'Unknown',
            price: productCard.querySelector('.product-price, .potm-price')?.textContent || '₱0.00',
            image: productCard.querySelector('.product-image-placeholder, .potm-image-placeholder')?.style.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || '',
            quantity: 1,
            safetyBox: false,
            safetyBoxPrice: 0
        };

        // Check for safety box selection
        const safetyBoxWith = productCard.querySelector('.safety-option.active[data-price="150"]');
        if (safetyBoxWith) {
            product.safetyBox = true;
            product.safetyBoxPrice = 150;
        }

        // Check for quantity input
        const quantityInput = productCard.querySelector('#quantity-input, input[type="number"]');
        if (quantityInput) {
            product.quantity = parseInt(quantityInput.value) || 1;
        }

        this.addItem(product);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Make cart globally accessible
window.florCart = cart;
