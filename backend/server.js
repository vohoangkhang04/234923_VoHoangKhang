require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Kiểm tra cấu hình MongoDB
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI chưa được cấu hình");
    process.exit(1);
}

// Kết nối MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Ket noi MongoDB Atlas thanh cong!");
    })
    .catch((error) => {
        console.error("Ket noi MongoDB that bai:", error.message);
        process.exit(1);
    });

// API kiểm tra Backend
app.get("/", (req, res) => {
    res.json({
        message: "Book Management API",
        studentId: "234923",
        studentName: "VoHoangKhang"
    });
});

// Kiểm tra trạng thái MongoDB
app.get("/api/health", (req, res) => {
    const connected = mongoose.connection.readyState === 1;

    res.status(connected ? 200 : 503).json({
        status: connected ? "connected" : "disconnected",
        database: "234923_VoHoangKhang"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});