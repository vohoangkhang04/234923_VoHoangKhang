
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/$/, "");

const emptyBook = {
  bookId: "",
  title: "",
  author: "",
  category: "",
  publisher: "",
  publishYear: new Date().getFullYear(),
  isbn: "",
  quantity: 0,
  description: ""
};

const fields = [
  ["bookId", "Mã sách"],
  ["title", "Tên sách"],
  ["author", "Tác giả"],
  ["category", "Thể loại"],
  ["publisher", "Nhà xuất bản"],
  ["publishYear", "Năm xuất bản"],
  ["isbn", "ISBN"],
  ["quantity", "Số lượng"],
  ["description", "Mô tả"]
];

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new Error("Không thể kết nối Backend. Kiểm tra server và API URL.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi HTTP ${response.status}`);
  }

  return data;
}

function App() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyBook);

  async function loadBooks(keyword = "") {
    setLoading(true);
    setError("");

    try {
      const query = keyword
        ? `?search=${encodeURIComponent(keyword)}`
        : "";

      const data = await request(`/api/books${query}`);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  function openAdd() {
    setForm({ ...emptyBook });
    setMode("add");
    setError("");
    setMessage("");
  }

  async function openDetail(bookId) {
    setLoading(true);
    setError("");

    try {
      const book = await request(
        `/api/books/${encodeURIComponent(bookId)}`
      );
      setSelected(book);
      setMode("detail");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(book) {
    const data = Object.fromEntries(
      fields.map(([key]) => [key, book[key] ?? ""])
    );
    setForm(data);
    setMode("edit");
    setError("");
    setMessage("");
  }

  async function saveBook(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      publishYear: Number(form.publishYear),
      quantity: Number(form.quantity)
    };

    const editing = mode === "edit";

    try {
      await request(
        editing
          ? `/api/books/${encodeURIComponent(form.bookId)}`
          : "/api/books",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload)
        }
      );

      setMode(null);
      setMessage(editing ? "Cập nhật sách thành công!" : "Thêm sách thành công!");
      await loadBooks(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBook(book) {
    if (!window.confirm(`Bạn có chắc muốn xóa "${book.title}"?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await request(
        `/api/books/${encodeURIComponent(book.bookId)}`,
        { method: "DELETE" }
      );
      setMode(null);
      setMessage("Xóa sách thành công!");
      await loadBooks(search);
    } catch (err) {
      setError(err.message);
    }
  }

  function closeModal() {
    setMode(null);
    setError("");
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <div>
            <h1>📚 Book Management</h1>
            <p>Hệ thống quản lý sách – 234923_VoHoangKhang</p>
          </div>
          <button className="btn primary" onClick={openAdd}>
            + Thêm sách
          </button>
        </div>
      </header>

      <main className="container">
        <section className="summary">
          <div>
            <span>Tổng sách đang hiển thị: </span>
            <strong>{books.length}</strong>
          </div>
          
        </section>

        <section className="panel">
          <div className="toolbar">
            <h2>Danh sách sách</h2>
            <form
              className="search"
              onSubmit={(e) => {
                e.preventDefault();
                loadBooks(search);
              }}
            >
              <input
                placeholder="Tìm tên sách, tác giả, thể loại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn primary" type="submit">
                Tìm kiếm
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setSearch("");
                  loadBooks("");
                }}
              >
                Đặt lại
              </button>
            </form>
          </div>

          {message && <div className="alert success">{message}</div>}
          {error && !mode && <div className="alert danger">{error}</div>}

          {loading ? (
            <div className="empty">Đang tải dữ liệu...</div>
          ) : books.length === 0 ? (
            <div className="empty">Không tìm thấy sách nào.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Thể loại</th>
                    <th>Năm XB</th>
                    <th>Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book._id || book.bookId}>
                      <td>{book.bookId}</td>
                      <td><b>{book.title}</b></td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>{book.publishYear}</td>
                      <td>{book.quantity}</td>
                      <td>
                        <div className="actions">
                          <button onClick={() => openDetail(book.bookId)}>
                            Xem
                          </button>
                          <button onClick={() => openEdit(book)}>
                            Sửa
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteBook(book)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {mode && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {mode === "add"
                  ? "Thêm sách mới"
                  : mode === "edit"
                  ? "Cập nhật sách"
                  : "Chi tiết sách"}
              </h2>
              <button onClick={closeModal}>✕</button>
            </div>

            {error && <div className="alert danger">{error}</div>}

            {mode === "detail" ? (
              <div className="details">
                {fields.map(([key, label]) => (
                  <div key={key}>
                    <strong>{label}</strong>
                    <span>{selected?.[key] ?? ""}</span>
                  </div>
                ))}
                <div className="form-actions">
                  <button className="btn" onClick={closeModal}>Đóng</button>
                  <button
                    className="btn primary"
                    onClick={() => openEdit(selected)}
                  >
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveBook}>
                <div className="form-grid">
                  {fields.map(([key, label]) => (
                    <label
                      key={key}
                      className={key === "description" ? "full" : ""}
                    >
                      {label}
                      {key === "description" ? (
                        <textarea
                          required
                          rows="3"
                          value={form[key]}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                        />
                      ) : (
                        <input
                          required
                          type={
                            ["publishYear", "quantity"].includes(key)
                              ? "number"
                              : "text"
                          }
                          min={key === "quantity" ? 0 : key === "publishYear" ? 1450 : undefined}
                          max={key === "publishYear" ? 2100 : undefined}
                          step="1"
                          disabled={mode === "edit" && key === "bookId"}
                          value={form[key]}
                          onChange={(e) =>
                            setForm({ ...form, [key]: e.target.value })
                          }
                        />
                      )}
                    </label>
                  ))}
                </div>
                <div className="form-actions">
                  <button type="button" className="btn" onClick={closeModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn primary" disabled={saving}>
                    {saving ? "Đang lưu..." : "Lưu thông tin"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
