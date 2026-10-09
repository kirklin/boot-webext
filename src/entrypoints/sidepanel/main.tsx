import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "~/components/theme-provider";
import App from "./app";
import "~/styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider target={document.documentElement}>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
