import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    allowedHosts: ["3xrpzp-5173.csb.app"], // ✅ Allow this host
    port: 5173, // optional, ensures consistent port
  },
});
