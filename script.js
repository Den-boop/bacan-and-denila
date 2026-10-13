
// ==========================================
// CAMPUS CRUMBS BAKERY POS SYSTEM
// Final Validation, Debugging, and Improvements
// ==========================================

// 1. PRODUCT LIST
const products = [
    { id: 1, name: "Pandesal (pack of 5)", price: 25, icon: "🥖" },
    { id: 2, name: "Ensaymada", price: 20, icon: "🥮" },
    { id: 3, name: "Spanish Bread", price: 15, icon: "🥐" },
    { id: 4, name: "Chocolate Cupcake", price: 30, icon: "🧁" },
    { id: 5, name: "Loaf Bread", price: 55, icon: "🍞" },
    { id: 6, name: "Brewed Coffee (cup)", price: 25, icon: "☕" }
];

// 2. TRANSACTION VARIABLES
let cart = [];
let paymentComplete = false;
let transactionCounter = 0;

// 3. HTML ELEMENTS
const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cashInput = document.getElementById("cashInput");
const paymentError = document.getElementById("paymentError");
const feedback = document.getElementById("feedback");
const payButton = document.getElementById("payButton");
const receipt = document.getElementById("receipt");
const receiptSection = document.getElementById("receiptSection");

// 4. FORMAT MONEY
function money(amount) {
    return "₱" + amount.toFixed(2);
}

// 5. DISPLAY FEEDBACK
function showFeedback(message, isError = false) {
    feedback.textContent = message;

    feedback.className = isError
        ? "feedback show error-feedback"
        : "feedback show";
}

// 6. CLEAR FEEDBACK
function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "feedback";
}

// 7. DISPLAY PAYMENT ERROR
function showPaymentError(message) {
    paymentError.textContent = message;
    cashInput.setAttribute("aria-invalid", "true");
    showFeedback(message, true);
}

// 8. CLEAR PAYMENT ERROR
function clearPaymentError() {
    paymentError.textContent = "";
    cashInput.removeAttribute("aria-invalid");
}

// 9. DISPLAY PRODUCTS
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <article class="product-card">
            <div class="product-art" aria-hidden="true">
                ${product.icon}
            </div>

            <div class="product-name">
                ${product.name}
            </div>

            <div class="product-bottom">
                <span class="price">
                    ${money(product.price)}
                </span>

                <button
                    class="add-button"
                    type="button"
                    data-add="${product.id}"
                    ${paymentComplete ? "disabled" : ""}
                >
                    + Add to Cart
                </button>
            </div>
        </article>
    `).join("");
}

// 10. CALCULATE TOTAL
function getTotal() {
    return cart.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
}

// 11. DISPLAY SHOPPING CART
function renderCart() {
    const count = cart.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    document.getElementById("cartCount").textContent = count;
    document.getElementById("itemCount").textContent = count;

    document.getElementById("totalAmount").textContent =
        money(getTotal());

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                Your basket is empty.
                <small>
                    Choose something tasty to get started.
                </small>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-row">
                <div class="cart-top">
                    <strong>${item.name}</strong>
                    <span>${money(item.price)} each</span>
                </div>

                <div class="cart-bottom">
                    <div class="quantity-controls">
                        <button
                            type="button"
                            data-decrease="${item.id}"
                            aria-label="Decrease ${item.name}"
                            ${
                                paymentComplete || item.quantity <= 1
                                    ? "disabled"
                                    : ""
                            }
                        >
                            −
                        </button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            data-increase="${item.id}"
                            aria-label="Increase ${item.name}"
                            ${paymentComplete ? "disabled" : ""}
                        >
                            +
                        </button>

                        <button
                            type="button"
                            class="remove-button"
                            data-remove="${item.id}"
                            ${paymentComplete ? "disabled" : ""}
                        >
                            Remove
                        </button>
                    </div>

                    <strong class="cart-subtotal">
                        ${money(item.price * item.quantity)}
                    </strong>
                </div>
            </div>
        `).join("");
    }

    payButton.disabled = paymentComplete;
    cashInput.disabled = paymentComplete;
}

// 12. RESET PAYMENT INPUT AFTER CART CHANGES
function resetPaymentInput() {
    cashInput.value = "";
    clearPaymentError();
}

// 13. ADD PRODUCT TO CART
function addToCart(id) {
    if (paymentComplete) return;

    const product = products.find(item => item.id === id);

    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    resetPaymentInput();
    renderCart();

    showFeedback(product.name + " added to your order.");
}

// 14. INCREASE OR DECREASE QUANTITY
function changeQuantity(id, amount) {
    if (paymentComplete) return;

    const item = cart.find(product => product.id === id);

    if (!item) return;

    const newQuantity = item.quantity + amount;

    // Prevent zero or negative quantities.
    if (newQuantity < 1) {
        return;
    }

    item.quantity = newQuantity;

    resetPaymentInput();
    renderCart();

    showFeedback("Product quantity updated.");
}

// 15. REMOVE PRODUCT FROM CART
function removeFromCart(id) {
    if (paymentComplete) return;

    const itemExists = cart.some(item => item.id === id);

    if (!itemExists) return;

    cart = cart.filter(item => item.id !== id);

    resetPaymentInput();
    renderCart();

    showFeedback("Item removed from the order.");
}

// 16. CREATE DIGITAL RECEIPT
function createReceipt(paid, change) {
    transactionCounter++;

    const reference =
        "CB-" + Date.now() + "-" + transactionCounter;

    const transactionDate = new Date().toLocaleString("en-PH");

    const rows = cart.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${money(item.price)}</td>
            <td>${money(item.price * item.quantity)}</td>
        </tr>
    `).join("");

    receipt.innerHTML = `
        <h3>Campus Crumbs</h3>

        <div class="receipt-sub">
            Bakery & Coffee · Digital Receipt
        </div>

        <div class="receipt-meta">
            <strong>Transaction:</strong> ${reference}
            <br>
            <strong>Date:</strong> ${transactionDate}
        </div>

        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Subtotal</th>
                </tr>
            </thead>

            <tbody>
                ${rows}
            </tbody>
        </table>

        <div class="receipt-summary">
            <div>
                <strong>Total Amount</strong>
                <strong>${money(getTotal())}</strong>
            </div>

            <div>
                <span>Cash Paid</span>
                <span>${money(paid)}</span>
            </div>

            <div>
                <strong>Change</strong>
                <strong>${money(change)}</strong>
            </div>
        </div>

        <div class="receipt-thanks">
            Payment successful!
            <br>
            Thank you for supporting our campus bakery. ♡
        </div>
    `;

    receiptSection.hidden = false;
}

// 17. VALIDATE AND PROCESS PAYMENT
function processPayment(event) {
    event.preventDefault();

    // Prevent duplicate payment.
    if (paymentComplete) return;

    clearPaymentError();

    // Check if the cart is empty.
    if (cart.length === 0) {
        showPaymentError(
            "Please add at least one product before paying."
        );
        return;
    }

    const raw = cashInput.value.trim();

    // Check blank input.
    if (raw === "") {
        showPaymentError(
            "Please enter a valid payment amount."
        );
        return;
    }

    // Validate the numeric input and decimal places.
    const validFormat = /^\d+(?:\.\d{1,2})?$/.test(raw);
    const paid = Number(raw);

    if (
        !validFormat ||
        !Number.isFinite(paid) ||
        paid < 0
    ) {
        showPaymentError(
            "Please enter a valid payment amount with at most two decimal places."
        );
        return;
    }

    // Convert amounts to cents for accurate calculation.
    const paidCents = Math.round(paid * 100);
    const totalCents = Math.round(getTotal() * 100);

    if (!Number.isSafeInteger(paidCents)) {
        showPaymentError(
            "Please enter a valid payment amount."
        );
        return;
    }

    // Check insufficient payment.
    if (paidCents < totalCents) {
        showPaymentError(
            "Insufficient payment. Please enter at least " +
            money(getTotal()) + "."
        );
        return;
    }

    // Calculate change.
    const changeCents = paidCents - totalCents;
    const change = changeCents / 100;

    // Mark payment as completed.
    paymentComplete = true;

    // Generate receipt.
    createReceipt(paidCents / 100, change);

    // Update interface and disable editing.
    renderCart();
    renderProducts();

    clearPaymentError();

    showFeedback(
        "Payment successful! Change: " +
        money(change) +
        ". Your receipt is ready below."
    );

    // Scroll to receipt.
    receiptSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// 18. START NEW TRANSACTION
function newTransaction() {
    // Clear cart.
    cart = [];

    // Unlock the POS.
    paymentComplete = false;

    // Clear payment input and errors.
    cashInput.value = "";
    clearPaymentError();

    // Clear previous receipt.
    receipt.innerHTML = "";
    receiptSection.hidden = true;

    // Clear previous messages.
    clearFeedback();

    // Refresh interface.
    renderCart();
    renderProducts();

    // Display new transaction confirmation.
    showFeedback(
        "New transaction started. Ready for the next customer!"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// 19. EVENT LISTENERS
// ==========================================

// Product buttons
productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (button) {
        addToCart(Number(button.dataset.add));
    }
});

// Shopping cart buttons
cartItems.addEventListener("click", event => {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.increase) {
        changeQuantity(
            Number(button.dataset.increase),
            1
        );
    }

    if (button.dataset.decrease) {
        changeQuantity(
            Number(button.dataset.decrease),
            -1
        );
    }

    if (button.dataset.remove) {
        removeFromCart(
            Number(button.dataset.remove)
        );
    }
});

// Payment form
document.getElementById("paymentForm")
    .addEventListener("submit", processPayment);

// New transaction button
document.getElementById("newTransaction")
    .addEventListener("click", newTransaction);

// Clear error when cashier edits cash input
cashInput.addEventListener("input", () => {
    clearPaymentError();

    if (feedback.classList.contains("error-feedback")) {
        clearFeedback();
    }
});

// ==========================================
// 20. INITIALIZE APPLICATION
// ==========================================

document.getElementById("todayDate").textContent =
    new Date().toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

renderProducts();
renderCart();
