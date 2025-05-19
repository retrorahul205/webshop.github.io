// DOM Elements
const cartLink = document.getElementById("cart-link")
const cartModal = document.getElementById("cart-modal")
const closeModal = document.querySelector(".close")
const cartItemsContainer = document.getElementById("cart-items")
const cartTotalElement = document.getElementById("cart-total")
const cartCountElement = document.getElementById("cart-count")
const checkoutBtn = document.getElementById("checkout-btn")

// Products Data (API)
const API_BASE_URL = "products.json"

// Cart
let cart = JSON.parse(localStorage.getItem("cart")) || []

// Initialize
function init() {
  updateCartCount()

  // Event Listeners
  if (cartLink) {
    cartLink.addEventListener("click", openCart)
  }

  if (closeModal) {
    closeModal.addEventListener("click", closeCart)
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", goToCheckout)
  }

  // Close cart modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) {
      closeCart()
    }
  })

  // Load page-specific content
  const currentPage = getCurrentPage()

  if (currentPage === "index") {
    loadFeaturedProducts()
  } else if (currentPage === "shop") {
    initShopPage()
  }

  // Add theme toggle button to the body
  const themeToggle = document.createElement("button")
  themeToggle.className = "theme-toggle"
  themeToggle.innerHTML = `
    <svg class="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
    <svg class="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
`
  document.body.appendChild(themeToggle)

  // Check for saved theme preference
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme")
  }

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme")

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark")
    } else {
      localStorage.setItem("theme", "light")
    }
  })
}

// Currency conversion (USD to INR)
const USD_TO_INR = 83.5 // Current exchange rate

function convertToINR(usdPrice) {
  // Convert and round to nearest whole number for cleaner prices
  return Math.round(usdPrice * USD_TO_INR)
}

// Format price in INR with ₹ symbol
function formatINR(price) {
  return "₹" + price.toLocaleString("en-IN")
}

// Helper Functions
function getCurrentPage() {
  const path = window.location.pathname
  if (path.includes("product.html")) return "product"
  if (path.includes("shop.html")) return "shop"
  if (path.includes("checkout.html")) return "checkout"
  return "index"
}

async function fetchProducts() {
  try {
    // Fix the path to use relative path
    const response = await fetch("./products.json") // removed 'api/' from path
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const data = await response.json()
    return data.products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

async function fetchProductById(productId) {
  try {
    const products = await fetchProducts()
    return products.find((product) => product.id === productId)
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

// Cart Functions
function openCart(e) {
  if (e) e.preventDefault()
  renderCartItems()
  cartModal.style.display = "block"
  document.body.style.overflow = "hidden"
}

function closeCart() {
  cartModal.style.display = "none"
  document.body.style.overflow = "auto"
}

function addToCart(product, quantity = 1) {
  const existingItemIndex = cart.findIndex((item) => item.id === product.id)

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })
  }

  saveCart()
  updateCartCount()

  // Show confirmation message
  showToast(`${product.name} added to cart!`)
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId)
  saveCart()
  updateCartCount()
  renderCartItems()
}

function updateCartItemQuantity(productId, newQuantity) {
  const itemIndex = cart.findIndex((item) => item.id === productId)

  if (itemIndex !== -1) {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      cart[itemIndex].quantity = newQuantity
      saveCart()
      renderCartItems()
    }
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart))
}

function updateCartCount() {
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  if (cartCountElement) {
    cartCountElement.textContent = totalItems
  }
}

function calculateCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
}

function renderCartItems() {
  if (!cartItemsContainer) return

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart!</p>
                <a href="shop.html" class="btn">Continue Shopping</a>
            </div>
        `
    cartTotalElement.textContent = "₹0"
    return
  }

  cartItemsContainer.innerHTML = ""

  cart.forEach((item) => {
    const cartItem = document.createElement("div")
    cartItem.className = "cart-item"

    const inrPrice = convertToINR(item.price)
    const inrTotal = convertToINR(item.price * item.quantity)

    cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">${formatINR(inrPrice)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase-quantity" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-total">${formatINR(inrTotal)}</div>
            <div class="cart-item-remove" data-id="${item.id}">Remove</div>
        `

    cartItemsContainer.appendChild(cartItem)
  })

  // Update total
  const total = calculateCartTotal()
  const inrTotal = convertToINR(total)
  cartTotalElement.textContent = formatINR(inrTotal)

  // Add event listeners
  document.querySelectorAll(".decrease-quantity").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id")
      const item = cart.find((item) => item.id === productId)
      if (item) {
        updateCartItemQuantity(productId, item.quantity - 1)
      }
    })
  })

  document.querySelectorAll(".increase-quantity").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id")
      const item = cart.find((item) => item.id === productId)
      if (item) {
        updateCartItemQuantity(productId, item.quantity + 1)
      }
    })
  })

  document.querySelectorAll(".cart-item-remove").forEach((btn) => {
    btn.addEventListener("click", function () {
      const productId = this.getAttribute("data-id")
      removeFromCart(productId)
    })
  })
}

function goToCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!")
    return
  }

  window.location.href = "checkout.html"
}

// Toast Notification
function showToast(message) {
  // Check if a toast already exists
  let toast = document.querySelector(".toast")

  if (!toast) {
    toast = document.createElement("div")
    toast.className = "toast"
    document.body.appendChild(toast)
  }

  // Create toast styles if not already in the document
  if (!document.querySelector("#toast-styles")) {
    const style = document.createElement("style")
    style.id = "toast-styles"
    style.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #333;
                color: #fff;
                padding: 16px 30px;
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 1000;
                font-size: 14px;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            }
            
            .toast.show {
                opacity: 1;
            }
        `
    document.head.appendChild(style)
  }

  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Home Page Functions
async function loadFeaturedProducts() {
  const featuredProductsContainer = document.getElementById("featured-products")
  if (!featuredProductsContainer) return

  try {
    const products = await fetchProducts()
    const featuredProducts = products.slice(0, 4) // Just show first 4 products

    if (featuredProducts.length === 0) {
      featuredProductsContainer.innerHTML = "<p>No featured products available.</p>"
      return
    }

    featuredProductsContainer.innerHTML = ""

    featuredProducts.forEach((product) => {
      const productElement = createProductCard(product)
      featuredProductsContainer.appendChild(productElement)
    })

    // Add event listeners
    addProductCardEventListeners()
  } catch (error) {
    console.error("Error loading featured products:", error)
    featuredProductsContainer.innerHTML = "<p>Failed to load products. Please try again later.</p>"
  }
}

function createProductCard(product) {
  const productCard = document.createElement("div")
  productCard.className = "product-card"

  const inrPrice = convertToINR(product.price)

  productCard.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-details">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">${formatINR(inrPrice)}</div>
            <div class="product-actions">
                <a href="product.html?id=${product.id}" class="btn view-btn">View</a>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        </div>
    `

  return productCard
}

function addProductCardEventListeners() {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const productId = this.getAttribute("data-id")
      const product = await fetchProductById(productId)

      if (product) {
        addToCart(product)
      }
    })
  })
}

// Shop Page Functions
async function initShopPage() {
  const productsGrid = document.getElementById("products-grid")
  const categoryFilters = document.getElementById("category-filters")
  const sortSelect = document.getElementById("sort-select")
  const priceRange = document.getElementById("price-range")
  const priceValue = document.getElementById("price-value")
  const productCount = document.getElementById("product-count")

  if (!productsGrid) return

  // Get category from URL if available
  const categoryParam = getQueryParam("category")

  // Load products
  const allProducts = await fetchProducts()
  let filteredProducts = [...allProducts]

  // Set initial category filter if provided in URL
  if (categoryParam && categoryParam !== "all") {
    filteredProducts = allProducts.filter((product) => product.category.toLowerCase() === categoryParam.toLowerCase())

    // Highlight the active category
    if (categoryFilters) {
      const activeFilter = document.querySelector(`.filter-link[data-category="${categoryParam}"]`)
      if (activeFilter) {
        document.querySelectorAll(".filter-link").forEach((link) => link.classList.remove("active"))
        activeFilter.classList.add("active")
      }
    }
  }

  // Filter by category
  if (categoryFilters) {
    categoryFilters.addEventListener("click", (e) => {
      if (e.target.classList.contains("filter-link")) {
        e.preventDefault()

        // Update active class
        document.querySelectorAll(".filter-link").forEach((link) => link.classList.remove("active"))
        e.target.classList.add("active")

        const category = e.target.getAttribute("data-category")

        // Filter products
        if (category === "all") {
          filteredProducts = [...allProducts]
        } else {
          filteredProducts = allProducts.filter((product) => product.category.toLowerCase() === category.toLowerCase())
        }

        // Apply price filter
        if (priceRange) {
          const maxPrice = Number.parseFloat(priceRange.value)
          filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice)
        }

        // Apply sort
        if (sortSelect) {
          applySorting(filteredProducts, sortSelect.value)
        }

        renderProducts(filteredProducts)
      }
    })
  }

  // Filter by price
  if (priceRange) {
    priceRange.addEventListener("input", function () {
      const maxPrice = Number.parseFloat(this.value)
      priceValue.textContent = `$${maxPrice}`

      // Apply category filter
      let currentFilteredProducts = [...allProducts]

      const activeFilter = document.querySelector(".filter-link.active")
      if (activeFilter) {
        const category = activeFilter.getAttribute("data-category")
        if (category !== "all") {
          currentFilteredProducts = allProducts.filter(
            (product) => product.category.toLowerCase() === category.toLowerCase(),
          )
        }
      }

      // Apply price filter
      filteredProducts = currentFilteredProducts.filter((product) => product.price <= maxPrice)

      // Apply sort
      if (sortSelect) {
        applySorting(filteredProducts, sortSelect.value)
      }

      renderProducts(filteredProducts)
    })
  }

  // Sort products
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applySorting(filteredProducts, this.value)
      renderProducts(filteredProducts)
    })
  }

  function applySorting(products, sortOption) {
    switch (sortOption) {
      case "price-low":
        products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        // Default sorting (featured)
        break
    }
  }

  function renderProducts(products) {
    if (!productsGrid) return

    if (products.length === 0) {
      productsGrid.innerHTML =
        '<div class="empty-state"><h3>No products found</h3><p>Try adjusting your filters</p></div>'
      if (productCount) {
        productCount.textContent = "Showing 0 products"
      }
      return
    }

    productsGrid.innerHTML = ""

    products.forEach((product) => {
      const productElement = createProductCard(product)
      productsGrid.appendChild(productElement)
    })

    if (productCount) {
      productCount.textContent = `Showing ${products.length} product${products.length !== 1 ? "s" : ""}`
    }

    // Add event listeners
    addProductCardEventListeners()
  }

  // Initial render
  renderProducts(filteredProducts)
}

// Initialize application
document.addEventListener("DOMContentLoaded", init)
