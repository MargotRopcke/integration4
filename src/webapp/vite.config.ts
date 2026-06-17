import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [reactRouter()],
  base: process.env.GITHUB_ACTIONS
    ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
    : "/",
});
