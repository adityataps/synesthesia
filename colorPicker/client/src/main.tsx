import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App.tsx";

// Create a root component to manage color scheme state
function Root() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  const toggleColorScheme = () => {
    setColorScheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <MantineProvider forceColorScheme={colorScheme}>
      <App toggleColorScheme={toggleColorScheme} colorScheme={colorScheme} />
    </MantineProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
