import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set to your repo name, e.g. "/retirement-planner/"
  // For custom domain or root deploy, use "/"
  base: "/retirement-planner/",
});
