const memberSelect = document.getElementById("memberSelect");
const bookSelect = document.getElementById("bookSelect");

const memberSearch = document.getElementById("memberSearch");
const memberResults = document.getElementById("memberResults");

const bookSearch = document.getElementById("bookSearch");
const bookResults = document.getElementById("bookResults");

const issuedTableBody = document.getElementById("issuedTableBody");

const historyTableBody = document.getElementById("historyTableBody");

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
  } else {
    messageModalIcon.className = "message-modal-icon message-error-icon";

    messageModalIcon.innerHTML = `<i class="bi bi-exclamation-lg"></i>`;
  }

  messageModal.show();
}

const confirmModal = new bootstrap.Modal(document.getElementById("confirmModal"));

const confirmReturnBtn = document.getElementById("confirmReturnBtn");

let members = [];
let books = [];

// Load members
async function loadMembers() {
  try {
    const response = await fetch("/api/members");

    members = await response.json();

    memberSearch.value = "";
    memberSelect.value = "";
    memberResults.innerHTML = "";
  } catch (error) {
    console.error("Error loading members:", error);
  }
}

memberSearch.addEventListener("input", () => {
  const searchTerm = memberSearch.value.trim().toLowerCase();

  memberSelect.value = "";
  memberResults.innerHTML = "";

  if (!searchTerm) {
    return;
  }

  const filteredMembers = members.filter((member) => {
    const id = String(member.member_id);

    const displayId = `mem-${id.padStart(3, "0")}`;

    return (
      id.includes(searchTerm) ||
      displayId.includes(searchTerm) ||
      member.name.toLowerCase().includes(searchTerm) ||
      (member.address || "").toLowerCase().includes(searchTerm)
    );
  });

  filteredMembers.forEach((member) => {
    const result = document.createElement("button");

    result.type = "button";
    result.className = "list-group-item list-group-item-action";

    const displayId = `MEM-${String(member.member_id).padStart(3, "0")}`;

    result.innerHTML = `
            <strong>${displayId}</strong>
            — ${member.name}
            <small class="d-block text-muted">
                ${member.address || "No address"}
            </small>
        `;

    result.addEventListener("click", () => {
      memberSelect.value = member.member_id;

      memberSearch.value = `${displayId} — ${member.name}`;

      memberResults.innerHTML = "";
    });

    memberResults.appendChild(result);
  });
});

// Load available books
async function loadBooks() {
  try {
    const response = await fetch("/api/books");

    books = await response.json();

    bookSearch.value = "";
    bookSelect.value = "";
    bookResults.innerHTML = "";
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

bookSearch.addEventListener("input", () => {
  const searchTerm = bookSearch.value.trim().toLowerCase();

  bookSelect.value = "";
  bookResults.innerHTML = "";

  if (!searchTerm) {
    return;
  }

  const availableBooks = books.filter((book) => book.status === "available");

  const filteredBooks = availableBooks.filter((book) => {
    const id = String(book.book_id);

    const displayId = `book-${id.padStart(3, "0")}`;

    return (
      id.includes(searchTerm) ||
      displayId.includes(searchTerm) ||
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      (book.category || "").toLowerCase().includes(searchTerm)
    );
  });

  filteredBooks.forEach((book) => {
    const result = document.createElement("button");

    result.type = "button";
    result.className = "list-group-item list-group-item-action";

    const displayId = `BOOK-${String(book.book_id).padStart(3, "0")}`;

    result.innerHTML = `
            <strong>${displayId}</strong>
            — ${book.title}

            <small class="d-block text-muted">
                ${book.author}
                ${book.category ? ` • ${book.category}` : ""}
            </small>
        `;

    result.addEventListener("click", () => {
      bookSelect.value = book.book_id;

      bookSearch.value = `${displayId} — ${book.title}`;

      bookResults.innerHTML = "";
    });

    bookResults.appendChild(result);
  });
});

// Load currently issued books
async function loadIssuedBooks() {
  try {
    const response = await fetch("/api/transactions/issued");

    const transactions = await response.json();

    issuedTableBody.innerHTML = "";

    if (transactions.length === 0) {
      issuedTableBody.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center text-muted">
                        No books are currently issued.
                    </td>
                </tr>
            `;

      return;
    }

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>TXN-${String(transaction.txn_id).padStart(3, "0")}</td>
                <td>${transaction.member_name}</td>
                <td>${transaction.book_title}</td>
                <td>${formatDate(transaction.issue_date)}</td>

                <td>
                    <button
                        class="btn return-action"
                        onclick="returnBook(${transaction.txn_id})"
                    >
                        <i class="bi bi-arrow-return-left"></i>
                        Return
                    </button>
                </td>
            `;

      issuedTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading issued books:", error);
  }
}

// Load transaction history
async function loadHistory() {
  try {
    const response = await fetch("/api/transactions");

    const transactions = await response.json();

    historyTableBody.innerHTML = "";

    if (transactions.length === 0) {
      historyTableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-muted">
                        No transactions found.
                    </td>
                </tr>
            `;

      return;
    }

    transactions.forEach((transaction) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>TXN-${String(transaction.txn_id).padStart(3, "0")}</td>
                <td>${transaction.member_name}</td>
                <td>${transaction.book_title}</td>
                <td>${formatDate(transaction.issue_date)}</td>
                <td>${formatDate(transaction.return_date)}</td>
                <td>₹${transaction.fine}</td>
            `;

      historyTableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading transaction history:", error);
  }
}

// Format dates for display
function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const issueForm = document.getElementById("issueForm");

issueForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const memberId = memberSelect.value;
  const bookId = bookSelect.value;

  if (!memberId || !bookId) {
    showMessage("Please select a member and a book.");
    return;
  }

  try {
    const response = await fetch("/api/transactions/issue", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        member_id: Number(memberId),
        book_id: Number(bookId),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.error || "Failed to issue book.");
      return;
    }

    showMessage("Book issued successfully!");

    issueForm.reset();

    // Refresh everything
    await loadBooks();
    await loadIssuedBooks();
    await loadHistory();
  } catch (error) {
    console.error("Error issuing book:", error);
    showMessage("Unable to connect to the server.");
  }
});

// Return a book
async function returnBook(transactionId) {
  confirmReturnBtn.onclick = async () => {
    try {
      const response = await fetch(`/api/transactions/return/${transactionId}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        confirmModal.hide();

        showMessage("Return Failed", data.error || "Failed to return book.", "error");

        return;
      }

      confirmModal.hide();

      await loadMembers();
      await loadBooks();
      await loadIssuedBooks();
      await loadHistory();

      showMessage("Book Returned", `Book returned successfully! Fine: ₹${data.fine}`);
    } catch (error) {
      console.error("Error returning book:", error);

      confirmModal.hide();

      showMessage("Connection Error", "Unable to connect to the server.", "error");
    }
  };

  confirmModal.show();
}

// Initial loading
loadMembers();
loadBooks();
loadIssuedBooks();
loadHistory();
