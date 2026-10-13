// Fixed bakery menu: prices are stored in Philippine pesos.
const products = [
    { id: 1, name: "Pandesal (pack of 5)", price: 25, icon: "🥖" },
    { id: 2, name: "Ensaymada", price: 20, icon: "🥮" },
    { id: 3, name: "Spanish Bread", price: 15, icon: "🥐" },
    { id: 4, name: "Chocolate Cupcake", price: 30, icon: "🧁" },
    { id: 5, name: "Loaf Bread", price: 55, icon: "🍞" },
    { id: 6, name: "Brewed Coffee (cup)", price: 25, icon: "☕" }
];

let cart = [];
let paymentComplete = false;
let transactionCounter = 0;

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cashInput = document.getElementById("cashInput");
const paymentError = document.getElementById("paymentError");
const feedback = document.getElementById("feedback");
const payButton = document.getElementById("payButton");

function money(amount) {
    return "₱" + amount.toFixed(2);
}

function showFeedback(message, isError = false) {
    feedback.textContent = message;
    feedback.className = isError ? "feedback show error-feedback" : "feedback show";
}

function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-art" aria-hidden="true">${product.icon}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-bottom">
                <span class="price">${money(product.price)}</span>
                <button class="add-button" type="button" data-add="${product.id}" ${paymentComplete ? "disabled" : ""}>+ Add to Cart</button>
            </div>
        </article>
    `).join("");
}

function getTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
    document.getElementById("itemCount").textContent = count;
    document.getElementById("totalAmount").textContent = money(getTotal());

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your basket is empty.<small>Choose something tasty to get started.</small></div>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-row">
                <div class="cart-top"><strong>${item.name}</strong><span>${money(item.price)} each</span></div>
                <div class="cart-bottom">
                    <div class="quantity-controls">
                        <button type="button" data-decrease="${item.id}" aria-label="Decrease ${item.name}" ${paymentComplete ? "disabled" : ""}>−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-increase="${item.id}" aria-label="Increase ${item.name}" ${paymentComplete ? "disabled" : ""}>+</button>
                        <button type="button" class="remove-button" data-remove="${item.id}" ${paymentComplete ? "disabled" : ""}>Remove</button>
                    </div>
                    <strong class="cart-subtotal">${money(item.price * item.quantity)}</strong>
                </div>
            </div>
        `).join("");
    }
    payButton.disabled = paymentComplete;
    cashInput.disabled = paymentComplete;
}

function clearPaymentError() {
    paymentError.textContent = "";
}

function addToCart(id) {
    if (paymentComplete) return;
    const product = products.find(item => item.id === id);
    if (!product) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    clearPaymentError();
    renderCart();
    showFeedback(product.name + " added to your order.");
}

function changeQuantity(id, amount) {
    if (paymentComplete) return;
    const item = cart.find(product => product.id === id);
    if (!item) return;
    item.quantity += amount;
    if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
    clearPaymentError();
    renderCart();
}

function removeFromCart(id) {
    if (paymentComplete) return;
    cart = cart.filter(item => item.id !== id);
    clearPaymentError();
    renderCart();
    showFeedback("Item removed from the order.");
}

function createReceipt(paid, change) {
    transactionCounter++;
    const reference = "CB-" + Date.now() + "-" + transactionCounter;
    const rows = cart.map(item => `
        <tr><td>${item.name}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td></tr>
    `).join("");
    document.getElementById("receipt").innerHTML = `
        <h3>Campus Crumbs</h3>
        <div class="receipt-sub">Bakery & Coffee · Digital Receipt</div>
        <div class="receipt-meta"><strong>Transaction:</strong> ${reference}<br><strong>Date:</strong> ${new Date().toLocaleString("en-PH")}</div>
        <table><thead><tr><th>Product</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="receipt-summary">
            <div><strong>Total Amount</strong><strong>${money(getTotal())}</strong></div>
            <div><span>Cash Paid</span><span>${money(paid)}</span></div>
            <div><strong>Change</strong><strong>${money(change)}</strong></div>
        </div>
        <div class="receipt-thanks">Payment successful! Thank you for supporting our campus bakery. ♡</div>
    `;
    document.getElementById("receiptSection").hidden = false;
}

function processPayment(event) {
    event.preventDefault();
    if (paymentComplete) return;
    clearPaymentError();
    if (cart.length === 0) {
        paymentError.textContent = "Please add at least one product before paying.";
        return;
    }
    const raw = cashInput.value.trim();
    const paid = Number(raw);
    if (raw === "" || !Number.isFinite(paid) || paid < 0) {
        paymentError.textContent = "Please enter a valid payment amount.";
        return;
    }
    // Round to cents to avoid floating-point display errors.
    if (Math.round(paid * 100) !== paid * 100 && !Number.isInteger(paid * 100)) {
        paymentError.textContent = "Please enter an amount with at most two decimal places.";
        return;
    }
    const totalCents = Math.round(getTotal() * 100);
    const paidCents = Math.round(paid * 100);
    if (paidCents < totalCents) {
        paymentError.textContent = "Insufficient payment. Please enter at least " + money(getTotal()) + ".";
        return;
    }
    const change = (paidCents - totalCents) / 100;
    paymentComplete = true;
    createReceipt(paidCents / 100, change);
    renderCart();
    renderProducts();
    showFeedback("Payment successful! Change: " + money(change) + ". Your receipt is ready below.");
    document.getElementById("receiptSection").scrollIntoView({ behavior: "smooth", block: "start" });
}

function newTransaction() {
    cart = [];
    paymentComplete = false;
    cashInput.value = "";
    clearPaymentError();
    document.getElementById("receipt").innerHTML = "";
    document.getElementById("receiptSection").hidden = true;
    renderCart();
    renderProducts();
    showFeedback("New transaction started. Ready for the next customer!");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");
    if (button) addToCart(Number(button.dataset.add));
});
cartItems.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.increase) changeQuantity(Number(button.dataset.increase), 1);
    if (button.dataset.decrease) changeQuantity(Number(button.dataset.decrease), -1);
    if (button.dataset.remove) removeFromCart(Number(button.dataset.remove));
});
document.getElementById("paymentForm").addEventListener("submit", processPayment);
document.getElementById("newTransaction").addEventListener("click", newTransaction);
cashInput.addEventListener("input", clearPaymentError);
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
renderProducts();
renderCart();
