import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/mdb-brasa/" : "/",
  plugins: [react()],
  server: { port: 5182, strictPort: true },
  preview: { port: 5182, strictPort: true },
});
