const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        bookId: {
            type: String,
            required: [true, "Ma sach la bat buoc"],
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: [true, "Ten sach la bat buoc"],
            trim: true
        },

        author: {
            type: String,
            required: [true, "Tac gia la bat buoc"],
            trim: true
        },

        category: {
            type: String,
            required: [true, "The loai la bat buoc"],
            trim: true
        },

        publisher: {
            type: String,
            required: [true, "Nha xuat ban la bat buoc"],
            trim: true
        },

        publishYear: {
            type: Number,
            required: true,
            min: [1450, "Nam xuat ban khong hop le"],
            max: [2100, "Nam xuat ban khong hop le"],
            validate: {
                validator: Number.isInteger,
                message: "Nam xuat ban phai la so nguyen"
            }
        },

        isbn: {
            type: String,
            required: [true, "ISBN la bat buoc"],
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: [0, "So luong khong duoc am"],
            validate: {
                validator: Number.isInteger,
                message: "So luong phai la so nguyen"
            }
        },

        description: {
            type: String,
            required: [true, "Mo ta la bat buoc"],
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "books"
    }
);

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;