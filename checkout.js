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

// Checkout Page
function initCheckoutPage() {
  const checkoutItemsContainer = document.getElementById("checkout-items")
  const subtotalElement = document.getElementById("subtotal")
  const taxElement = document.getElementById("tax")
  const shippingElement = document.getElementById("shipping")
  const totalElement = document.getElementById("checkout-total")
  const shippingForm = document.getElementById("shipping-form")

  if (!checkoutItemsContainer) return

  // Get cart from local storage
  const cart = JSON.parse(localStorage.getItem("cart")) || []

  if (cart.length === 0) {
    // Redirect to shop if cart is empty
    window.location.href = "shop.html"
    return
  }

  // Render checkout items
  renderCheckoutItems(cart)

  // Calculate and display totals
  updateOrderSummary(cart)

  // Handle form submission
  if (shippingForm) {
    shippingForm.addEventListener("submit", handleCheckoutSubmit)
  }

  function renderCheckoutItems(cartItems) {
    checkoutItemsContainer.innerHTML = ""

    cartItems.forEach((item) => {
      const checkoutItem = document.createElement("div")
      checkoutItem.className = "checkout-item"

      const inrPrice = convertToINR(item.price * item.quantity)

      checkoutItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
                <div class="checkout-item-details">
                    <h3>${item.name}</h3>
                    <div class="checkout-item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="checkout-item-price">${formatINR(inrPrice)}</div>
            `

      checkoutItemsContainer.appendChild(checkoutItem)
    })
  }

  function updateOrderSummary(cartItems) {
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const shipping = 5.0 // Fixed shipping cost
    const taxRate = 0.07 // 7% tax rate
    const tax = subtotal * taxRate
    const total = subtotal + shipping + tax

    const inrSubtotal = convertToINR(subtotal)
    const inrShipping = convertToINR(shipping)
    const inrTax = convertToINR(tax)
    const inrTotal = convertToINR(total)

    if (subtotalElement) subtotalElement.textContent = formatINR(inrSubtotal)
    if (taxElement) taxElement.textContent = formatINR(inrTax)
    if (shippingElement) shippingElement.textContent = formatINR(inrShipping)
    if (totalElement) totalElement.textContent = formatINR(inrTotal)
  }

  function handleCheckoutSubmit(e) {
    e.preventDefault()

    const name = document.getElementById("name")?.value || "Customer"
    const email = document.getElementById("email")?.value
    const addr = document.getElementById("address")?.value

    var templateParams = {
      to_name: name,
      to_email: email,
      to_address: addr,
      message: "Thank you for your order! Your products will be shipped soon.",
    }

    showProcessingOverlay()

    emailjs.send("service_adn5by9", "template_x61p1jo", templateParams).then(
      (response) => {
        console.log("SUCCESS!", response.status, response.text)
        setTimeout(() => {
          localStorage.removeItem("cart")
          window.location.href = "order-success.html"
        }, 2000)
      },
      (error) => {
        console.log("FAILED...", error)
        alert("Order placed, but failed to send confirmation email.")
        setTimeout(() => {
          localStorage.removeItem("cart")
          window.location.href = "order-success.html"
        }, 2000)
      },
    )

    // const params={

    // }

    // if (!email) {
    //     alert("Please enter a valid email address.");
    //     return;
    // }

    // showProcessingOverlay();

    // // Send email confirmation
    // emailjs.send("service_adn5by9", "template_ee8qqk3", {
    //     to_name: name,
    //     to_email: email,
    //     message: "Thank you for your order! Your products will be shipped soon.",
    // }, "5iNjbzU5LG0xrjs_D")
    // .then(() => {
    //     console.log("Email sent successfully!");

    //     // Simulate success and redirect
    //     setTimeout(() => {
    //         localStorage.removeItem('cart');
    //         window.location.href = 'order-success.html';
    //     }, 2000);
    // })
    // .catch((error) => {
    //     console.error("Email failed:", error);
    //     alert("Order placed, but failed to send confirmation email.");
    //     setTimeout(() => {
    //         localStorage.removeItem('cart');
    //         window.location.href = 'order-success.html';
    //     }, 2000);
    // });
  }

  function showProcessingOverlay() {
    // Create processing overlay
    const overlay = document.createElement("div")
    overlay.className = "processing-overlay"

    overlay.innerHTML = `
            <div class="processing-content">
                <div class="spinner"></div>
                <h2>Processing your order</h2>
                <p>Please do not close this page...</p>
            </div>
        `

    // Create overlay styles
    const style = document.createElement("style")
    style.textContent = `
            .processing-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .processing-content {
                background-color: #fff;
                padding: 40px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }
            
            .spinner {
                border: 5px solid #f3f3f3;
                border-top: 5px solid #ff6b6b;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `

    document.head.appendChild(style)
    document.body.appendChild(overlay)
  }
}

// Initialize checkout page
document.addEventListener("DOMContentLoaded", initCheckoutPage)
