// Currency conversion (USD to INR)

function convertToINR(usdPrice) {
  // Convert and round to nearest whole number for cleaner prices
  return Math.round(usdPrice * USD_TO_INR)
}

// Format price in INR with ₹ symbol
function formatINR(price) {
  return "₹" + price.toLocaleString("en-IN")
}

// Product Details Page
async function initProductPage() {
  const productContainer = document.getElementById("product-container")
  const relatedProductsContainer = document.getElementById("related-products")
  const productBreadcrumb = document.getElementById("product-breadcrumb")

  if (!productContainer) return

  // Get product ID from URL
  const productId = getQueryParam("id")

  if (!productId) {
    productContainer.innerHTML =
      '<div class="empty-state"><h2>Product Not Found</h2><p>The product you\'re looking for does not exist.</p><a href="shop.html" class="btn">Back to Shop</a></div>'
    return
  }

  try {
    // Fetch all products - Fix the path to use relative path
    const response = await fetch("./products.json") // removed 'api/' from path
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const data = await response.json()
    const products = data.products

    // Find the specific product by ID
    const product = products.find((p) => p.id === productId)

    if (!product) {
      productContainer.innerHTML =
        '<div class="empty-state"><h2>Product Not Found</h2><p>The product you\'re looking for does not exist.</p><a href="shop.html" class="btn">Back to Shop</a></div>'
      return
    }

    // Update page title
    document.title = `${product.name} - ShopEasy`

    // Update breadcrumb
    if (productBreadcrumb) {
      productBreadcrumb.textContent = product.name
    }

    // Render product details
    const inrPrice = convertToINR(product.price)

    productContainer.innerHTML = `
          <div class="product-gallery">
              <img src="${product.image}" alt="${product.name}" class="main-image">
              <div class="gallery-thumbnails">
                  <img src="${product.image}" alt="${product.name}" class="thumbnail active">
                  ${product.gallery ? product.gallery.map((img) => `<img src="${img}" alt="${product.name}" class="thumbnail">`).join("") : ""}
              </div>
          </div>
          <div class="product-info">
              <h1>${product.name}</h1>
              <div class="product-category">${product.category}</div>
              <div class="product-price">${formatINR(inrPrice)}</div>
              <div class="product-description">${product.description}</div>
              
              <div class="product-meta">
                  <p><strong>SKU:</strong> ${product.id}</p>
                  <p><strong>Availability:</strong> ${product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
              </div>
              
              <div class="product-quantity">
                  <label>Quantity:</label>
                  <div class="quantity-selector">
                      <button class="quantity-btn decrease">-</button>
                      <input type="number" class="quantity-input" value="1" min="1" max="${product.stock || 10}">
                      <button class="quantity-btn increase">+</button>
                  </div>
              </div>
              
              <button id="add-to-cart-large" class="btn add-to-cart-large">Add to Cart</button>
          </div>
      `

    // Set up quantity selector
    const quantityInput = document.querySelector(".quantity-input")
    const decreaseBtn = document.querySelector(".quantity-btn.decrease")
    const increaseBtn = document.querySelector(".quantity-btn.increase")

    if (decreaseBtn) {
      decreaseBtn.addEventListener("click", () => {
        const currentValue = Number.parseInt(quantityInput.value)
        if (currentValue > 1) {
          quantityInput.value = currentValue - 1
        }
      })
    }

    if (increaseBtn) {
      increaseBtn.addEventListener("click", () => {
        const currentValue = Number.parseInt(quantityInput.value)
        const maxValue = Number.parseInt(quantityInput.max)
        if (currentValue < maxValue) {
          quantityInput.value = currentValue + 1
        }
      })
    }

    // Add to cart button
    const addToCartBtn = document.getElementById("add-to-cart-large")
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => {
        const quantity = Number.parseInt(quantityInput.value)
        addToCart(product, quantity)
      })
    }

    // Gallery thumbnail functionality
    const mainImage = document.querySelector(".main-image")
    const thumbnails = document.querySelectorAll(".thumbnail")

    thumbnails.forEach((thumbnail) => {
      thumbnail.addEventListener("click", function () {
        // Update active class
        thumbnails.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")

        // Update main image
        mainImage.src = this.src
      })
    })

    // Load related products
    if (relatedProductsContainer) {
      loadRelatedProducts(products, product.category, product.id)
    }
  } catch (error) {
    console.error("Error loading product details:", error)
    productContainer.innerHTML =
      '<div class="empty-state"><h2>Error</h2><p>Failed to load product details. Please try again later.</p><a href="shop.html" class="btn">Back to Shop</a></div>'
  }
}

async function loadRelatedProducts(allProducts, category, currentProductId) {
  const relatedProductsContainer = document.getElementById("related-products")
  if (!relatedProductsContainer) return

  try {
    // Filter products by category and exclude current product
    const relatedProducts = allProducts
      .filter((product) => product.category === category && product.id !== currentProductId)
      .slice(0, 4) // Limit to 4 related products

    if (relatedProducts.length === 0) {
      relatedProductsContainer.innerHTML = "<p>No related products found.</p>"
      return
    }

    relatedProductsContainer.innerHTML = ""

    relatedProducts.forEach((product) => {
      const productCard = createProductCard(product)
      relatedProductsContainer.appendChild(productCard)
    })

    // Add event listeners to the "Add to Cart" buttons
    document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const productId = this.getAttribute("data-id")
        const product = allProducts.find((p) => p.id === productId)

        if (product) {
          addToCart(product)
        }
      })
    })
  } catch (error) {
    console.error("Error loading related products:", error)
    relatedProductsContainer.innerHTML = "<p>Failed to load related products.</p>"
  }
}

// Helper function to create a product card
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

// Helper function to get query parameters from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(param)
}

// Fetch products from the API - Remove this function as we're fetching directly in initProductPage
// async function fetchProducts() {
//   try {
//     const response = await fetch("api/products.json")
//     const data = await response.json()
//     return data.products
//   } catch (error) {
//     console.error("Error fetching products:", error)
//     return []
//   }
// }

// Add to cart function
function addToCart(product, quantity = 1) {
  // Get current cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || []

  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex((item) => item.id === product.id)

  if (existingItemIndex > -1) {
    // Update quantity if product already in cart
    cart[existingItemIndex].quantity += quantity
  } else {
    // Add new product to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart))

  // Update cart count in the header
  updateCartCount()

  // Show confirmation message
  showToast(`${product.name} added to cart!`)
}

// Update cart count in the header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || []
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  const cartCountElement = document.getElementById("cart-count")
  if (cartCountElement) {
    cartCountElement.textContent = totalItems
  }
}

// Show toast notification
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

// Initialize product page
document.addEventListener("DOMContentLoaded", initProductPage)
