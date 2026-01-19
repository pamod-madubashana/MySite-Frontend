import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// Check if there's a redirect path stored in sessionStorage
const redirectPath = sessionStorage.getItem('redirectPath');
if (redirectPath && redirectPath !== '/') {
  // Clear the stored path to avoid infinite redirects
  sessionStorage.removeItem('redirectPath');
  // Update the browser history to the intended path
  window.history.replaceState(null, '', redirectPath);
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <App />
  </BrowserRouter>
);
