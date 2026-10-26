// ========================================
// 1. DARK MODE TOGGLE
// ========================================
const darkModeToggle = document.getElementById("darkModeToggle");
// Remember the user's theme
const savedTheme = localStorage.getItem("shopease-theme");
if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}
function updateThemeButton() {
    if (!darkModeToggle) return;
    const isDark = document.body.classList.contains("dark-mode");
    darkModeToggle.textContent = isDark ? "☀️" : "🌙";
    darkModeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
}
// Set the correct icon when the page loads
updateThemeButton();
// Toggle between light and dark mode
if (darkModeToggle) {
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem(
            "shopease-theme",
            isDark ? "dark" : "light"
        );
        updateThemeButton();
    });
}
// ========================================
// 2. SHOPPING CART
// ========================================
// Load the saved cart or start with an empty one
let cart = [];
try {
    const savedCart = JSON.parse(
        localStorage.getItem("shopease-cart") || "[]"
    );
    if (Array.isArray(savedCart)) {
        cart = savedCart.filter(item =>
            item &&
            typeof item.name === "string" &&
            Number.isFinite(Number(item.price)) &&
            Number.isFinite(Number(item.quantity)) &&
            Number(item.price) >= 0 &&
            Number(item.quantity) > 0
        ).map(item => ({
            name: item.name,
            price: Number(item.price),
            quantity: Math.floor(Number(item.quantity))
        }));
    }
} catch (error) {
    cart = [];
}
// Save cart in browser storage
function saveCart() {
    localStorage.setItem("shopease-cart", JSON.stringify(cart));
}
// Update cart number in navbar
function updateCartCount() {
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );
        cartCount.textContent = totalItems;
    }
}
// Show a small popup notification
function showNotification(message) {
    let notification = document.getElementById("shopEaseToast");
    if (!notification) {
        notification = document.createElement("div");
        notification.id = "shopEaseToast";
        notification.className = "toast";
        notification.setAttribute("role", "status");
        notification.setAttribute("aria-live", "polite");
        document.body.appendChild(notification);
    }
    notification.textContent = message;
    notification.hidden = false;
    clearTimeout(window.shopEaseToastTimer);
    window.shopEaseToastTimer = setTimeout(function () {
        notification.hidden = true;
    }, 2500);
}
// Add a product to the cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    saveCart();
    updateCartCount();
    showNotification(name + " added to your cart! ♡");
}
// Connect all Add to Cart buttons
document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);
        if (!name || !Number.isFinite(price) || price < 0) {
            showNotification("Sorry, this product could not be added.");
            return;
        }
        addToCart(name, price);
    });
});
// Display saved cart count when the page opens
updateCartCount();
// ========================================
// 3. PRODUCT SEARCH
// ========================================
const productSearch = document.getElementById("productSearch");
if (productSearch) {
    productSearch.addEventListener("input", function () {
        const searchTerm = productSearch.value.toLowerCase().trim();
        document.querySelectorAll(".product-card").forEach(function (card) {
            const productName = card.textContent.toLowerCase();
            card.hidden = !productName.includes(searchTerm);
        });
    });
}
// ========================================
// 4. CATEGORY FILTER
// ========================================
const categoryFilter = document.getElementById("categoryFilter");
function filterProducts() {
    const selectedCategory = categoryFilter
        ? categoryFilter.value.toLowerCase()
        : "all";
    const searchTerm = productSearch
        ? productSearch.value.toLowerCase().trim()
        : "";
    document.querySelectorAll(".product-card").forEach(function (card) {
        const name = card.dataset.name ||
            card.querySelector("h3")?.textContent ||
            "";
        const category = card.dataset.category || "";
        const matchesSearch = (
            name + " " + card.textContent
        ).toLowerCase().includes(searchTerm);
        const matchesCategory =
            selectedCategory === "all" ||
            category.toLowerCase() === selectedCategory;
        card.hidden = !(matchesSearch && matchesCategory);
    });
}
if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts);
}
if (productSearch) {
    productSearch.addEventListener("input", filterProducts);
}
// ========================================
// 5. PRODUCT DETAILS POPUP
// ========================================
document.querySelectorAll(".view-details").forEach(function (button) {
    button.addEventListener("click", function () {
        const card = button.closest(".product-card");
        if (!card) return;
        const name = card.dataset.name ||
            card.querySelector("h3")?.textContent ||
            "Product";
        const description = card.dataset.description ||
            card.querySelector(".product-description")?.textContent ||
            "A lovely find from ShopEase. ♡";
        const price = Number(card.dataset.price);
        const priceText = Number.isFinite(price)
            ? "\nPrice: ₹" + price.toLocaleString("en-IN")
            : "";
        alert(name + "\n\n" + description + priceText);
    });
});
// ========================================
// 6. CONTACT FORM VALIDATION
// ========================================
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }
        showNotification("Thank you! Your form looks good. ♡");
        contactForm.reset();
    });
}
// ========================================
// 7. SHOP NOW SCROLLING
// ========================================
document.querySelectorAll('a[href="#featured"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
        const featuredSection = document.getElementById("featured");
        if (featuredSection) {
            event.preventDefault();
            featuredSection.scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});
// ========================================
// 8. CATEGORY LINKS FROM HOMEPAGE
// ========================================
// Example: products.html?category=beauty
const pageParams = new URLSearchParams(window.location.search);
const requestedCategory = pageParams.get("category");
if (requestedCategory && categoryFilter) {
    const matchingOption = Array.from(categoryFilter.options).find(
        option => option.value.toLowerCase() === requestedCategory.toLowerCase()
    );
    if (matchingOption) {
        categoryFilter.value = matchingOption.value;
        filterProducts();
    }
}
// ========================================
// SHOPPING CART SUMMARY FIX
// ========================================
function renderCart() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    // Run only on the page containing the cart summary
    if (!cartItems || !cartTotal) return;
    cartItems.innerHTML = "";
    if (cart.length === 0) {
        cartItems.innerHTML =
            "<p>Your cart is waiting for something lovely. ♡</p>";
        cartTotal.textContent = "₹0";
        updateCartCount();
        return;
    }
    let total = 0;
    cart.forEach(function (item, index) {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const row = document.createElement("div");
        row.className = "cart-item";
        const name = document.createElement("span");
        name.textContent = item.name;
        const quantity = document.createElement("span");
        quantity.textContent =
            "₹" + item.price.toLocaleString("en-IN") +
            " × " + item.quantity;
        const subtotal = document.createElement("span");
        subtotal.textContent =
            "₹" + itemTotal.toLocaleString("en-IN");
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "btn btn-outline";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", function () {
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            renderCart();
        });
        row.append(name, quantity, subtotal, removeButton);
        cartItems.appendChild(row);
    });
    cartTotal.textContent = "₹" + total.toLocaleString("en-IN");
    updateCartCount();
}
// Update summary after adding a product
const originalAddToCart = addToCart;
addToCart = function (name, price) {
    originalAddToCart(name, price);
    renderCart();
};
// Clear the entire cart
const clearCartButton = document.getElementById("clearCart");
if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
        cart = [];
        saveCart();
        renderCart();
        showNotification("Your cart has been cleared ♡");
    });
}
// Show saved items when the page opens
renderCart();