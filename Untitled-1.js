const express = require("express");
const cors = require("cors");

const app = express();

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());


// =========================================================
// PRODUCTS
// =========================================================

const products = [
    {
        id: 1,
        name: "Pringles",
        price: 120,
        measurement: "107g",
        category: "Snacks"
    },
    {
        id: 2,
        name: "Kinder Joy",
        price: 50,
        measurement: "20g",
        category: "Chocolates"
    },
    {
        id: 3,
        name: "Wafer Chocolate",
        price: 40,
        measurement: "50g",
        category: "Chocolates"
    },
    {
        id: 4,
        name: "Dairy Milk",
        price: 60,
        measurement: "50g",
        category: "Chocolates"
    },
    {
        id: 5,
        name: "Coca Cola",
        price: 40,
        measurement: "750ml",
        category: "Drinks"
    },
    {
        id: 6,
        name: "Pepsi",
        price: 40,
        measurement: "750ml",
        category: "Drinks"
    },
    {
        id: 7,
        name: "Sprite",
        price: 40,
        measurement: "750ml",
        category: "Drinks"
    },
    {
        id: 8,
        name: "Lays",
        price: 20,
        measurement: "50g",
        category: "Snacks"
    },
    {
        id: 9,
        name: "Bingo",
        price: 20,
        measurement: "50g",
        category: "Snacks"
    },
    {
        id: 10,
        name: "Good Day Biscuits",
        price: 30,
        measurement: "100g",
        category: "Biscuits"
    }
];


// =========================================================
// ORDERS
// =========================================================

const orders = [];


// =========================================================
// HOME / HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Aruna Products API is running!",
        version: "1.0.0"
    });
});


// =========================================================
// GET ALL PRODUCTS
// =========================================================

app.get("/api/products", (req, res) => {

    res.json({
        success: true,
        count: products.length,
        products: products
    });
});


// =========================================================
// GET SINGLE PRODUCT
// =========================================================

app.get("/api/products/:id", (req, res) => {

    const id = Number(req.params.id);

    const product = products.find(
        item => item.id === id
    );

    if (!product) {

        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    res.json({
        success: true,
        product: product
    });
});


// =========================================================
// GET PRODUCTS BY CATEGORY
// =========================================================

app.get("/api/products/category/:category", (req, res) => {

    const category =
        req.params.category.toLowerCase();

    const filteredProducts =
        products.filter(item =>
            item.category.toLowerCase() === category
        );

    res.json({
        success: true,
        count: filteredProducts.length,
        products: filteredProducts
    });
});


// =========================================================
// SEARCH PRODUCTS
// =========================================================

app.get("/api/search", (req, res) => {

    const search =
        String(req.query.q || "")
            .trim()
            .toLowerCase();

    if (!search) {

        return res.json({
            success: true,
            count: products.length,
            products: products
        });
    }

    const results =
        products.filter(item =>
            item.name.toLowerCase().includes(search)
        );

    res.json({
        success: true,
        count: results.length,
        products: results
    });
});


// =========================================================
// GET CATEGORIES
// =========================================================

app.get("/api/categories", (req, res) => {

    const categories = [
        ...new Set(
            products.map(item => item.category)
        )
    ];

    res.json({
        success: true,
        categories: categories
    });
});


// =========================================================
// CREATE ORDER
// =========================================================

app.post("/api/orders", (req, res) => {

    const {
        items,
        phoneNumber,
        address,
        paymentMethod
    } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return res.status(400).json({
            success: false,
            message: "Order items are required"
        });
    }

    if (!phoneNumber) {

        return res.status(400).json({
            success: false,
            message: "Phone number is required"
        });
    }

    if (!address) {

        return res.status(400).json({
            success: false,
            message: "Delivery address is required"
        });
    }

    if (!paymentMethod) {

        return res.status(400).json({
            success: false,
            message: "Payment method is required"
        });
    }


    // -----------------------------------------------------
    // CALCULATE TOTAL
    // -----------------------------------------------------

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {

        const product =
            products.find(
                product => product.id === Number(item.productId)
            );

        if (!product) {

            return res.status(400).json({
                success: false,
                message:
                    `Product ${item.productId} not found`
            });
        }

        const quantity =
            Number(item.quantity);

        if (
            !Number.isInteger(quantity) ||
            quantity <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        const itemTotal =
            product.price * quantity;

        subtotal += itemTotal;

        orderItems.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            itemTotal: itemTotal
        });
    }


    // -----------------------------------------------------
    // DELIVERY CHARGE
    // -----------------------------------------------------

    const deliveryCharge =
        subtotal > 0 ? 30 : 0;


    const total =
        subtotal + deliveryCharge;


    // -----------------------------------------------------
    // CREATE ORDER ID
    // -----------------------------------------------------

    const orderNumber =
        1001 + orders.length;

    const orderId =
        `Order #${orderNumber}`;


    // -----------------------------------------------------
    // CREATE ORDER
    // -----------------------------------------------------

    const newOrder = {

        orderId: orderId,

        items: orderItems,

        subtotal: subtotal,

        deliveryCharge: deliveryCharge,

        totalAmount: total,

        phoneNumber: phoneNumber,

        address: address,

        paymentMethod: paymentMethod,

        status: "Order Placed",

        createdAt: new Date().toISOString()
    };


    // -----------------------------------------------------
    // SAVE ORDER
    // -----------------------------------------------------

    orders.push(newOrder);


    // -----------------------------------------------------
    // RESPONSE
    // -----------------------------------------------------

    res.status(201).json({

        success: true,

        message: "Order placed successfully",

        order: newOrder
    });
});


// =========================================================
// GET ALL ORDERS
// =========================================================

app.get("/api/orders", (req, res) => {

    res.json({

        success: true,

        count: orders.length,

        orders: orders
    });
});


// =========================================================
// GET SINGLE ORDER
// =========================================================

app.get("/api/orders/:orderId", (req, res) => {

    const order =
        orders.find(
            item =>
                item.orderId ===
                req.params.orderId
        );

    if (!order) {

        return res.status(404).json({

            success: false,

            message: "Order not found"
        });
    }

    res.json({

        success: true,

        order: order
    });
});


// =========================================================
// CANCEL ORDER
// =========================================================

app.put("/api/orders/:orderId/cancel", (req, res) => {

    const order =
        orders.find(
            item =>
                item.orderId ===
                req.params.orderId
        );

    if (!order) {

        return res.status(404).json({

            success: false,

            message: "Order not found"
        });
    }


    if (order.status === "Order Cancelled") {

        return res.status(400).json({

            success: false,

            message: "Order is already cancelled"
        });
    }


    order.status =
        "Order Cancelled";


    res.json({

        success: true,

        message: "Order cancelled successfully",

        order: order
    });
});


// =========================================================
// 404 ROUTE
// =========================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API route not found"
    });
});


// =========================================================
// SERVER
// =========================================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Aruna Products API running on http://localhost:${PORT}`
    );

    console.log(
        `Products API: http://localhost:${PORT}/api/products`
    );
});