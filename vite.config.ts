import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          api: ["axios"],
          ui: ["@headlessui/react", "@heroicons/react", "lucide-react"],
        },
      },
    },
    minify: "terser",
    target: "esnext",
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
  },
  server: {
    middlewareMode: false,
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 5173,
    },
  },
  preview: {
    port: 4173,
  },
});
