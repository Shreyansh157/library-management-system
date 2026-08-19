const booksTableBody = document.getElementById("booksTableBody");
const searchInput = document.getElementById("searchInput");

const bookForm = document.getElementById("bookForm");

const bookModal = new bootstrap.Modal(document.getElementById("bookModal"));

const modalTitle = document.getElementById("modalTitle");
const bookId = document.getElementById("bookId");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const categoryInput = document.getElementById("category");
// const statusGroup = document.getElementById("statusGroup");
// const statusInput = document.getElementById("status");

const messageModal = new bootstrap.Modal(document.getElementById("messageModal"));

const messageModalIcon = document.getElementById("messageModalIcon");

const messageModalTitle = document.getElementById("messageModalTitle");

const messageModalText = document.getElementById("messageModalText");

function showMessage(title, message, type = "success") {
  messageModalTitle.textContent = title;
  messageModalText.textContent = message;

  if (type === "success") {
    messageModalIcon.className = "message-modal-icon";

    messageModalIcon.innerHTML = `<i class="bi bi-check-lg"></i>`;
  } else if (type === "error") {
    messageModalIcon.className = "message-modal-icon message-error-icon";

    messageModalIcon.innerHTML = `<i class="bi bi-exclamation-lg"></i>`;
  }

  messageModal.show();
}

let books = [];

async function loadBooks() {
  try {
    const response = await fetch("/api/books");
    books = await response.json();

    displayBooks(books);
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

async function editBook(id) {
  const book = books.find((book) => book.book_id === id);

  if (!book) {
    showMessage("Book not found");
    return;
  }

  // Change modal to edit mode
  modalTitle.textContent = "Edit Book";

  // Fill the form with existing data
  bookId.value = book.book_id;
  titleInput.value = book.title;
  authorInput.value = book.author;
  categoryInput.value = book.category || "";
  // statusInput.value = book.status;

  // Show status field while editing
  // statusGroup.style.display = "block";

  // Open modal
  bookModal.show();
}

const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

function deleteBook(id) {
  confirmDeleteBtn.onclick = async () => {
    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        confirmModal.hide();

        showMessage("Delete Failed", data.error || "Unable to delete the book.", "error");

        return;
      }

      confirmModal.hide();

      await loadBooks();

      showMessage("Book Deleted", "The book was deleted successfully.");
    } catch (error) {
      console.error("Error deleting book:", error);

      confirmModal.hide();

      showMessage("Error", "Unable to connect to the server.", "error");
    }
  };

  confirmModal.show();
}

function displayBooks(bookList) {
  booksTableBody.innerHTML = "";

  if (bookList.length === 0) {
    booksTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No books found.
                </td>
            </tr>
        `;

    return;
  }

  bookList.forEach((book) => {
    const row = document.createElement("tr");

    const statusBadge =
      book.status === "available"
        ? `
            <span class="status-badge status-available">
                <i class="bi bi-check-circle"></i>
                Available
            </span>
        `
        : `
            <span class="status-badge status-issued">
                <i class="bi bi-arrow-up-right-circle"></i>
                Issued
            </span>
        `;

    const displayId = `BOOK-${String(book.book_id).padStart(3, "0")}`;

    row.innerHTML = `
    <td>
        <strong>${displayId}</strong>
    </td>

    <td>
        ${book.title}
    </td>

    <td>
        ${book.author}
    </td>

    <td>
        ${book.category || "-"}
    </td>

    <td>
        ${statusBadge}
    </td>

    <td class="text-end">

        <div class="action-buttons">

            <button
                class="btn table-action edit-action"
                onclick="editBook(${book.book_id})"
                title="Edit book"
            >
                <i class="bi bi-pencil"></i>
                Edit
            </button>

            <button
                class="btn table-action delete-action"
                onclick="deleteBook(${book.book_id})"
                title="Delete book"
            >
                <i class="bi bi-trash3"></i>
                Delete
            </button>

        </div>

    </td>
`;

    booksTableBody.appendChild(row);
  });
}

bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = bookId.value;

  const bookData = {
    title: titleInput.value.trim(),
    author: authorInput.value.trim(),
    category: categoryInput.value.trim(),
  };

  // Include status when editing
  // if (id) {
  //   bookData.status = statusInput.value;
  // }

  try {
    const url = id ? `/api/books/${id}` : "/api/books";

    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookData),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Failed to save book");
      return;
    }

    if (bookId.value) {
      showMessage("Book Updated", "The book was updated successfully.");
    } else {
      showMessage("Book Added", "The book was added successfully.");
    }

    bookForm.reset();
    bookId.value = "";

    modalTitle.textContent = "Add Book";
    // statusGroup.style.display = "none";

    bookModal.hide();

    await loadBooks();
  } catch (error) {
    console.error("Error saving book:", error);
    showMessage("Unable to connect to the server.");
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const bookId = String(book.book_id);

    const displayId = `book-${bookId.padStart(3, "0")}`;

    return (
      bookId.includes(searchTerm) ||
      displayId.includes(searchTerm) ||
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.category || "").toLowerCase().includes(searchTerm)
    );
  });

  displayBooks(filteredBooks);
});

function openAddBookModal() {
  bookForm.reset();
  bookId.value = "";

  modalTitle.textContent = "Add Book";
}

loadBooks();
