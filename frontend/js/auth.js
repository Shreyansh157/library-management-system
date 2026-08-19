const loggedInUser = sessionStorage.getItem("user");

if (!loggedInUser) {
  window.location.href = "/";
}
