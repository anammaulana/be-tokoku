const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Get all products
router.get("/", async (req, res) => {
    console.log("✅ GET /api/products called");  // Log request
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  

// Create a new product
router.post("/", async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    
    if (!name || !price || !stock) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product added!", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product by ID
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product updated!", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product by ID
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
