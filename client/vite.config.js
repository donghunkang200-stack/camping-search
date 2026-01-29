import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // 모든 /api 요청을 Node.js 통합 서버(5000)로 전달
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
