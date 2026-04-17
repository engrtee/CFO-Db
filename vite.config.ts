import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: { outDir: "dist", sourcemap: false },
  optimizeDeps: { exclude: ["lucide-react"] },
  server: {
    allowedHosts: ["3xrpzp-5173.csb.app"],
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
