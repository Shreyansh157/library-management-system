const userData = sessionStorage.getItem("user");
const user = JSON.parse(userData);

document.getElementById("userName").textContent = user.name;

document.getElementById("logoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("user");
  window.location.href = "/";
});

async function loadDashboardStats() {
  try {
    const response = await fetch("/api/dashboard/stats");

    const stats = await response.json();

    if (!response.ok) {
      throw new Error(stats.error || "Failed to load dashboard");
    }

    document.getElementById("totalBooks").textContent = stats.total_books;

    document.getElementById("availableBooks").textContent = stats.available_books;

    document.getElementById("issuedBooks").textContent = stats.issued_books;

    document.getElementById("totalMembers").textContent = stats.total_members;
  } catch (error) {
    console.error("Error loading dashboard statistics:", error);
  }
}

loadDashboardStats();
