const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products"); // Folder tempat menyimpan gambar
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file dengan timestamp
  },
});

// Filter file hanya menerima gambar
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa gambar!"), false);
  }
};

// Middleware upload
const upload = multer({ storage, fileFilter });

//  GET: Ambil semua produk
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

//  POST: Tambah produk dengan gambar
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const image = req.file ? `/uploads/products/${req.file.filename}` : null;

    if (!name || !price || !stock) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    const product = new Product({ name, price, stock, image });
    await product.save();
    res.status(201).json({ message: "Produk berhasil ditambahkan!", product });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan produk" });
  }
});

//  GET: Ambil produk berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil produk" });
  }
});

//  PUT: Update produk berdasarkan ID
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    const image = req.file ? `/uploads/products/${req.file.filename}` : undefined;

    const updatedData = { name, price, stock };
    if (image) updatedData.image = image;

    const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });

    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    res.json({ message: "Produk berhasil diperbarui!", product });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui produk" });
  }
});

//  DELETE: Hapus produk berdasarkan ID
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ error: "Produk tidak ditemukan" });

    res.json({ message: "Produk berhasil dihapus!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

module.exports = router;
