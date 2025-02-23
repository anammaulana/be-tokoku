require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));


// Event listener untuk status koneksi MongoDB
mongoose.connection.on("connected", () => console.log("🔗 MongoDB Connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.get('/', (req, res) => {
    res.send("🚀 API is running...");
});
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
