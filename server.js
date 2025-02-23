require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB tanpa opsi yang deprecated
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error:", err));

app.get('/', (req, res) => {
    res.send("API is running...");
});

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
  });
  
  const Product = mongoose.model("Product", ProductSchema);
  
  // Routes CRUD
  app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
  });
  
  app.post("/products", async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product added!", product });
  });
  
  app.get("/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
  });
  
  app.put("/products/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Product updated!", product });
  });
  
  app.delete("/products/:id", async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted!" });
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
