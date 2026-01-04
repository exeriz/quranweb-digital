import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AudioProvider, ModalProvider, ThemeProvider } from "@/context";
import { ErrorBoundary } from "@/components/common";
import App from "@/App";
import "@/styles/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
});

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ModalProvider>
          <AudioProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AudioProvider>
        </ModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
