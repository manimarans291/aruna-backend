const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors());
app.use(express.json());

// =========================================================
// MONGODB CONNECTION
// =========================================================

// Render Environment Variable
const MONGO_URL = process.env.MONGODB_URI;

mongoose
    .connect(MONGO_URL)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

// =========================================================
// PRODUCT SCHEMA
// =========================================================

const productSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            unique: true,
            required: true
        },

        name: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
        },

        measurement: {
            type: String,
            required: true
        },

        category: {
            type: String,
            required: true
        },

        image: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Product =
    mongoose.model(
        "Product",
        productSchema
    );

// =========================================================
// ORDER SCHEMA
// =========================================================

const orderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            unique: true,
            required: true
        },

        phoneNumber: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        items: {
            type: Array,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            default: "Placed"
        }
    },
    {
        timestamps: true
    }
);

const Order =
    mongoose.model(
        "Order",
        orderSchema
    );

// =========================================================
// HOME / HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Aruna Products API is running",
        version: "2.0.0",
        database: "MongoDB"
    });

});

// =========================================================
// GET ALL PRODUCTS
// =========================================================

app.get("/api/products", async (req, res) => {

    try {

        const products =
            await Product.find()
                .sort({ id: 1 });

        res.json({

            success: true,

            count:
                products.length,

            products:
                products

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                "Failed to get products"

        });

    }

});

// =========================================================
// GET SINGLE PRODUCT
// =========================================================

app.get(
    "/api/products/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const product =
                await Product.findOne({
                    id: id
                });

            if (!product) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }

            res.json({

                success: true,

                product:
                    product

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to get product"

            });

        }

    }
);

// =========================================================
// GET PRODUCTS BY CATEGORY
// =========================================================

app.get(
    "/api/products/category/:category",
    async (req, res) => {

        try {

            const category =
                req.params.category
                    .trim();

            const products =
                await Product.find({

                    category: {

                        $regex:
                            new RegExp(
                                `^${category}$`,
                                "i"
                            )

                    }

                })
                    .sort({ id: 1 });

            res.json({

                success: true,

                count:
                    products.length,

                products:
                    products

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to get category products"

            });

        }

    }
);

// =========================================================
// SEARCH PRODUCTS
// =========================================================

app.get(
    "/api/search",
    async (req, res) => {

        try {

            const search =
                String(
                    req.query.q || ""
                )
                    .trim();

            if (!search) {

                const products =
                    await Product.find()
                        .sort({ id: 1 });

                return res.json({

                    success: true,

                    count:
                        products.length,

                    products:
                        products

                });

            }

            const products =
                await Product.find({

                    name: {

                        $regex: search,

                        $options: "i"

                    }

                })
                    .sort({ id: 1 });

            res.json({

                success: true,

                count:
                    products.length,

                products:
                    products

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Search failed"

            });

        }

    }
);

// =========================================================
// GET ALL CATEGORIES
// =========================================================

app.get(
    "/api/categories",
    async (req, res) => {

        try {

            const categories =
                await Product.distinct(
                    "category"
                );

            res.json({

                success: true,

                count:
                    categories.length,

                categories:
                    categories

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to get categories"

            });

        }

    }
);

// =========================================================
// ADD PRODUCT
// =========================================================

app.post(
    "/api/products",
    async (req, res) => {

        try {

            const {
                name,
                price,
                measurement,
                category,
                image
            } = req.body;

            // VALIDATION

            if (!name) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product name is required"

                });

            }

            if (price === undefined) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product price is required"

                });

            }

            if (!measurement) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product measurement is required"

                });

            }

            if (!category) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product category is required"

                });

            }

            // GET NEXT ID

            const lastProduct =
                await Product.findOne()
                    .sort({ id: -1 });

            const nextId =
                lastProduct
                    ? lastProduct.id + 1
                    : 1;

            // CREATE PRODUCT

            const newProduct =
                await Product.create({

                    id:
                        nextId,

                    name:
                        name,

                    price:
                        Number(price),

                    measurement:
                        measurement,

                    category:
                        category,

                    image:
                        image || ""

                });

            res.status(201).json({

                success: true,

                message:
                    "Product added successfully",

                product:
                    newProduct

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to add product"

            });

        }

    }
);

// =========================================================
// DELETE PRODUCT
// =========================================================

app.delete(
    "/api/products/:id",
    async (req, res) => {

        try {

            const id =
                Number(req.params.id);

            const deletedProduct =
                await Product.findOneAndDelete({

                    id:
                        id

                });

            if (!deletedProduct) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found"

                });

            }

            res.json({

                success: true,

                message:
                    "Product deleted successfully",

                product:
                    deletedProduct

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete product"

            });

        }

    }
);

// =========================================================
// CREATE ORDER
// =========================================================

app.post(
    "/api/orders",
    async (req, res) => {

        try {

            const {
                phoneNumber,
                address,
                items,
                totalAmount
            } = req.body;

            // VALIDATION

            if (!phoneNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Phone number is required"

                });

            }

            if (!address) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Address is required"

                });

            }

            if (
                !items ||
                !Array.isArray(items) ||
                items.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Order items are required"

                });

            }

            if (
                totalAmount === undefined
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Total amount is required"

                });

            }

            // CREATE ORDER

            const newOrder =
                await Order.create({

                    orderId:
                        "ORD" +
                        Date.now(),

                    phoneNumber:
                        phoneNumber,

                    address:
                        address,

                    items:
                        items,

                    totalAmount:
                        Number(totalAmount),

                    status:
                        "Placed"

                });

            res.status(201).json({

                success: true,

                message:
                    "Order placed successfully",

                order:
                    newOrder

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to place order"

            });

        }

    }
);

// =========================================================
// GET ALL ORDERS
// =========================================================

app.get(
    "/api/orders",
    async (req, res) => {

        try {

            const orders =
                await Order.find()
                    .sort({
                        createdAt: -1
                    });

            res.json({

                success: true,

                count:
                    orders.length,

                orders:
                    orders

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to get orders"

            });

        }

    }
);

// =========================================================
// GET SINGLE ORDER
// =========================================================

app.get(
    "/api/orders/:orderId",
    async (req, res) => {

        try {

            const order =
                await Order.findOne({

                    orderId:
                        req.params.orderId

                });

            if (!order) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"

                });

            }

            res.json({

                success: true,

                order:
                    order

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to get order"

            });

        }

    }
);

// =========================================================
// UPDATE ORDER STATUS
// =========================================================

app.put(
    "/api/orders/:orderId/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;

            if (!status) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Order status is required"

                });

            }

            const order =
                await Order.findOneAndUpdate(

                    {
                        orderId:
                            req.params.orderId
                    },

                    {
                        status:
                            status
                    },

                    {
                        new: true
                    }

                );

            if (!order) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"

                });

            }

            res.json({

                success: true,

                message:
                    "Order status updated successfully",

                order:
                    order

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to update order"

            });

        }

    }
);

// =========================================================
// DELETE ORDER
// =========================================================

app.delete(
    "/api/orders/:orderId",
    async (req, res) => {

        try {

            const deletedOrder =
                await Order.findOneAndDelete({

                    orderId:
                        req.params.orderId

                });

            if (!deletedOrder) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"

                });

            }

            res.json({

                success: true,

                message:
                    "Order deleted successfully",

                order:
                    deletedOrder

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to delete order"

            });

        }

    }
);

// =========================================================
// 404 ROUTE
// =========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API route not found"

        });

    }
);

// =========================================================
// SERVER
// =========================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Aruna Products API running on http://localhost:${PORT}`
        );

        console.log(
            `Products API: http://localhost:${PORT}/api/products`
        );

        console.log(
            `Categories API: http://localhost:${PORT}/api/categories`
        );

        console.log(
            `Search API: http://localhost:${PORT}/api/search?q=lays`
        );

        console.log(
            `Orders API: http://localhost:${PORT}/api/orders`
        );

    }
);