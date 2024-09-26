import { readFileSync } from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const packageJson = JSON.parse(readFileSync("./package.json", { encoding: "utf-8" }));
const globals = {
  ...(packageJson?.dependencies || {}),
};

function resolve(str: string) {
  return path.resolve(__dirname, str);
}

export default defineConfig({
  plugins: [react()],
  build: {
    // 输出文件夹
    outDir: "lib",
    lib: {
      // 组件库源码的入口文件
      entry: resolve("packages/index.tsx"),
      // 组件库名称
      name: "HmWaterfall",
      // 文件名称, 打包结果举例: suemor.cjs
      fileName: "suemor",
      // 打包格式
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      //排除不相关的依赖
      external: ["react", "react-dom", ...Object.keys(globals)],
    },
  },
});
