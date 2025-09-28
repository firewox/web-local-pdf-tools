import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: { target: "esnext", outDir: 'dist' },
  base: "/web-local-pdf-tools/",
  worker: {format :'es'},
  server: { port: 3000 },       // 开发端口
  preview: { port: 5000 },      // 预览端口
});
