# 🛒 Shop Easy

**Shop Easy** is a modern, responsive shopping website built with **HTML, CSS, JavaScript**, and **Node.js**.
It allows users to browse products, add items to their cart, place orders, and automatically receive a **custom email receipt** using **EmailJS**.

This project was developed as part of a college web-development project to demonstrate **frontend–backend integration**, **user interactivity**, and **real-world e-commerce features**.

---

## 🚀 Features

* 🏬 **Product Catalog:** Browse and view detailed information for each item.
* 🛍️ **Add to Cart:** Smooth cart management with live price updates.
* 💳 **Checkout System:** Collects customer details and confirms the order.
* 📧 **Email Receipt:** Sends personalized order receipts directly to the customer via **EmailJS**.
* 🧠 **Smart Form Validation:** Ensures valid user input before order submission.

---

## 🧩 Tech Stack

| Layer               | Technologies Used         |
| :------------------ | :------------------------ |
| **Frontend**        | HTML • CSS                |
| **Backend**         | Javascript                |
| **Email Service**   | EmailJS (client-side API) |
| **Version Control** | Git • GitHub              |

---

## 📂 Project Structure

```
Shop-Easy/
│
├── public/
│   ├── index.html
│   ├── products.html
│   ├── cart.html
│   ├── styles/
│   │   └── style.css
│   ├── scripts/
│   │   └── main.js
│   └── assets/
│       └── images/
│
├── js/
│   └── main.js , product.js , checkout.js
│
├── package.json
└── README.md
```
This was the initial setup for the project but because of some problems i had to keep all the files outside to upload them sorry for the inconvenience.

---

## ⚙️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/Shop-Easy.git
   cd Shop-Easy
   ```

2. **go live from index.html for home page**

---

## ✉️ Email Receipt Integration

Shop Easy uses **EmailJS** to send customers a customized receipt immediately after placing an order.

**Implementation overview:**

* The checkout form collects user details (name, email, order summary).
* JavaScript triggers an **EmailJS API call** to send a templated email.
* The email includes order details, total amount, and a thank-you message.

**Environment variables required:**

```
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID=your_template_id
EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 🧭 Future Improvements

* 🧾 Real-time database for products and orders
* 🔐 User authentication and profile pages
* 💰 Online payment gateway (Stripe / Razorpay)
* 📦 Admin panel for inventory management
* ☁️ Deployment to Render / Vercel / Netlify

---

## 👨‍💻 Developer

**Developed by:** *Rahul Chaudhary*
**Project Type:** College Web Development Project

> Built with ❤️ using **HTML, CSS, JS, and EmailJS**

---

## 🪪 License

This project is open-source under the [MIT License](LICENSE).
You’re free to use and modify it for educational and personal projects.
