const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.className = "alert alert-danger";
      loginMessage.textContent = data.error;
      return;
    }

    // Store logged-in user information
    sessionStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard.html";
  } catch (error) {
    console.error("Login error:", error);

    loginMessage.className = "alert alert-danger";
    loginMessage.textContent = "Unable to connect to the server.";
  }
});
