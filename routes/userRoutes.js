const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// Konfigurasi multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/users"); // Folder tempat menyimpan gambar
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

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User berhasil terdaftar" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, image: user.image } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get All Users (Protected)
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Get User by ID (Protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update User (Protected)
router.put("/:id", upload.single("image"), auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const image = req.file ? `/uploads/users/${req.file.filename}` : undefined;

    const updatedUser = { name, email };
    if (image) updatedUser.image = image;

    const user = await User.findByIdAndUpdate(req.params.id, updatedUser, { new: true });
   
    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    res.json({ message: "User berhasil diperbarui!", user});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete User (Protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
