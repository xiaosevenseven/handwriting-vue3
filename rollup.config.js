/**
 * rollup 配置文件
 */

import path from "path";
import ts from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve"; // 解析第三方模块

const packagesDir = path.resolve(__dirname, "packages"); // 获取 packages 目录的绝对路径
const packaheDir = path.resolve(packagesDir, process.env.TARGET); // 获取要打包的目标
const resolve = (p) => path.resolve(packaheDir, p); // 将打包的目标路径转换成绝对路径
const name = path.basename(packaheDir); // 获取要打包的包名
const pkg = require(resolve("package.json")); // 获取要打包的包的 package.json
const packageOptions = pkg.buildOptions; // 获取 package.json 中的 buildOptions 字段

const outputConfigs = {
  // webpack 打包用
  "esm-bundler": {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: "es",
  },
  // node 使用
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: "cjs",
  },
  // 全局的
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: "iife",
  },
};

function createConfig(format, output) {
  output.name = packageOptions.name;
  output.sourcemap = true;
  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      json(),
      ts({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      resolvePlugin()
    ]
  }
}

export default packageOptions.formats.map((format) => createConfig(format, outputConfigs[format]));
