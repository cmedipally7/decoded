import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: true,
    // With VITE_USE_MOCKS=false and no VITE_API_BASE_URL, /api calls go to the local backend.
    proxy: { "/api": "http://localhost:3000" },
  },
  preview: { host: "0.0.0.0", port: 5173, allowedHosts: true },
});
