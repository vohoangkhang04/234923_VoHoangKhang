require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bookRoutes = require("./src/routes/bookRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Kiem tra trang thai backend
app.get("/health", (req, res) => {
    const databaseConnected =
        mongoose.connection.readyState === 1;

    return res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? "OK" : "UNAVAILABLE",
        service: "Book Management API",
        database: databaseConnected
            ? "connected"
            : "disconnected"
    });
});

// API quan ly sach
app.use("/api/books", bookRoutes);

// Endpoint khong ton tai
app.use((req, res) => {
    return res.status(404).json({
        message: "API khong ton tai"
    });
});

// Xu ly JSON khong hop le va loi server
app.use((err, req, res, next) => {
    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            message: "JSON khong hop le"
        });
    }

    console.error(err.message);

    return res.status(500).json({
        message: "Loi may chu"
    });
});

// Ket noi MongoDB Atlas
async function startServer() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("Chua cau hinh MONGO_URI");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        // Bao dam index unique cua bookId duoc tao
        const Book = require("./src/models/Book");
        await Book.init();

        console.log("Ket noi MongoDB Atlas thanh cong!");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Khoi dong that bai:", error.message);
        process.exit(1);
    }
}

startServer();