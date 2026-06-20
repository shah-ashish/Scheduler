import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load .env so vite.config.js can read VITE_* vars at build/dev time
  const env = loadEnv(mode, process.cwd(), "");
  const serverUrl = env.VITE_SERVER_URL || "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Forward all /api/* requests to the Express server
        // Change VITE_SERVER_URL in .env to point to a different backend
        "/api": {
          target: serverUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
