import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  ssr: {
    noExternal: [],
    external: [],
  },
  optimizeDeps: {
    exclude: ["@mediapipe/tasks-vision"],
  },
  resolve: {
    conditions: ["browser"],
  },
  build: {
    rollupOptions: {
      external: (id) => id.startsWith("https://"),
    },
  },
});