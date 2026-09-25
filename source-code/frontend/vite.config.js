import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const sharedDir = path.resolve(__dirname, "../shared");

export default defineConfig({
  plugins: [react()],
  envDir: repoRoot,
  resolve: {
    alias: {
      "@shared": sharedDir
    }
  },
  server: {
    host: true,
    port: Number(process.env.FRONTEND_PORT || 5173),
    fs: {
      allow: [path.resolve(__dirname, ".."), sharedDir]
    }
  }
});
