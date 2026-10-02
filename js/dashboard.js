import { API } from "./auth.js";

const me = await API.me();

if (!me?.user) {
  window.location.href = "index.html";
} else {
  document.getElementById("welcome").textContent =
    `Welcome, ${me.user.name}`;
}