import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";
export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
    dts({
      insertTypesEntry: true, // 插入类型入口文件
    }),
  ],
  build: {
    // 输出文件夹
    outDir: "lib",
    lib: {
      // 组件库源码的入口文件
      entry: "./packages/index.tsx",
      // 组件库名称
      name: "HmWaterfall",
      fileName: (format) => `hm-waterfall.${format}.js`,
      // 打包格式
      formats: ["es", "umd"],
    },
    rollupOptions: {
      output: {
        globals: {
          react: "React", // UMD 格式下，React 的全局变量名
          "react-dom": "ReactDOM", // UMD 格式下，ReactDOM 的全局变量名
        },
        exports: "named",
      },
      //排除不相关的依赖
      external: ["react", "react-dom"],
    },
  },
});
