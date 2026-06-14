import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "@fontsource/inter";

// ==========================================
// GLOBAL FETCH INTERCEPTOR (Auto-Auth & 401 Handler)
// ==========================================
const originalFetch = window.fetch;

window.fetch = async function (input, init = {}) {
  // 1. Get the token from local storage
  const token = localStorage.getItem("token");

  // 2. Ensure headers object exists
  init.headers = init.headers || {};

  // 3. Inject the Authorization header if a token exists
  if (token) {
    // Handle both standard Objects and the Headers API
    if (init.headers instanceof Headers) {
      if (!init.headers.has("Authorization")) {
        init.headers.append("Authorization", `Bearer ${token}`);
      }
    } else {
      if (!init.headers["Authorization"]) {
        init.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  // 4. Call the original native fetch
  const response = await originalFetch(input, init);

  // 5. Global 401 Unauthorized Handler
  if (response.status === 401) {
    // Only redirect if the token actually existed (prevents infinite loops)
    if (localStorage.getItem("token")) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
  }

  return response;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);