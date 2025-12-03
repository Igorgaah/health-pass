import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./utils/registerSW";

// Registrar Service Worker para PWA e notificações
registerServiceWorker();

createRoot(document.getElementById("root")!).render(<App />);
