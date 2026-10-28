const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

const fields = [
    "bookId",
    "title",
    "author",
    "category",
    "publisher",
    "publishYear",
    "isbn",
    "quantity",
    "description"
];

// Kiểm tra dữ liệu đầu vào
function validateBook(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return "Du lieu phai la mot JSON object";
    }

    const keys = Object.keys(data);

    if (keys.some(key => !fields.includes(key))) {
        return "Du lieu chua truong khong hop le";
    }

    for (const field of fields) {
        if (data[field] === undefined || data[field] === null) {
            return `Thieu truong ${field}`;
        }

        if (["publishYear", "quantity"].includes(field)) {
            if (!Number.isInteger(data[field])) {
                return `${field} phai la so nguyen`;
            }
        } else {
            if (
                typeof data[field] !== "string" ||
                !data[field].trim()
            ) {
                return `${field} phai la chuoi khong rong`;
            }
        }
    }

    if (data.quantity < 0) {
        return "So luong khong duoc am";
    }

    if (data.publishYear < 1450 || data.publishYear > 2100) {
        return "Nam xuat ban khong hop le";
    }

    return null;
}

// Xử lý lỗi chung cho các thao tác database
function handleError(error, res) {
    console.error("Database error:", error.message);

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Ma sach da ton tai"
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Du lieu khong hop le",
            errors: Object.values(error.errors).map(e => e.message)
        });
    }

    if (
        error.name === "MongoNetworkError" ||
        error.name === "MongoServerSelectionError" ||
        error.name === "MongooseServerSelectionError" ||
        error.name === "MongoNetworkTimeoutError" ||
        error.name === "MongooseError"
    ) {
        return res.status(503).json({
            message: "Khong the truy cap co so du lieu"
        });
    }

    return res.status(500).json({
        message: "Loi may chu"
    });
}

// 1. GET /api/books
// 6. GET /api/books?search=cloud
router.get("/", async (req, res) => {
    try {
        const { search } = req.query;

        if (search !== undefined && typeof search !== "string") {
            return res.status(400).json({
                message: "Tu khoa tim kiem khong hop le"
            });
        }

        let filter = {};

        if (search && search.trim()) {
            // Escape ky tu dac biet trong Regex
            const keyword = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter = {
                $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { author: { $regex: keyword, $options: "i" } },
                    { category: { $regex: keyword, $options: "i" } }
                ]
            };
        }

        const books = await Book.find(filter).sort({ bookId: 1 });

        return res.status(200).json(books);
    } catch (error) {
        return handleError(error, res);
    }
});

// 2. GET /api/books/:id
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findOne({
            bookId: req.params.id
        });

        if (!book) {
            return res.status(404).json({
                message: "Khong tim thay sach"
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        return handleError(error, res);
    }
});

// 3. POST /api/books
router.post("/", async (req, res) => {
    try {
        const errorMessage = validateBook(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const book = new Book(req.body);

        await book.save();

        return res.status(201).json({
            message: "Them sach thanh cong",
            data: book
        });
    } catch (error) {
        return handleError(error, res);
    }
});

// 4. PUT /api/books/:id
router.put("/:id", async (req, res) => {
    try {
        const errorMessage = validateBook(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        // Khong cho doi ma sach thong qua endpoint cap nhat
        if (req.body.bookId !== req.params.id) {
            return res.status(400).json({
                message: "Khong duoc thay doi ma sach"
            });
        }

        const book = await Book.findOne({
            bookId: req.params.id
        });

        if (!book) {
            return res.status(404).json({
                message: "Khong tim thay sach"
            });
        }

        book.set(req.body);

        const updatedBook = await book.save();

        return res.status(200).json({
            message: "Cap nhat sach thanh cong",
            data: updatedBook
        });
    } catch (error) {
        return handleError(error, res);
    }
});

// 5. DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
    try {
        const deletedBook = await Book.findOneAndDelete({
            bookId: req.params.id
        });

        if (!deletedBook) {
            return res.status(404).json({
                message: "Khong tim thay sach"
            });
        }

        return res.status(200).json({
            message: "Xoa sach thanh cong",
            data: deletedBook
        });
    } catch (error) {
        return handleError(error, res);
    }
});

module.exports = router;