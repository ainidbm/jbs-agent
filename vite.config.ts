import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/jbs-agent/",
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy deps into separate chunks so initial page loads fast
          antd: ["antd", "@ant-design/icons"],
          echarts: ["echarts", "echarts-for-react"],
          vendor: ["react", "react-dom", "react-router-dom", "dayjs"],
        },
      },
    },
    // Target modern browsers only — smaller bundles
    target: "es2020",
  },
});
