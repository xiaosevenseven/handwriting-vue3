/**
 *
 */

const fs = require("fs");
const execa = require("execa"); // 开启子进程进行打包

const target = "reactivity";

build(target);
async function build(target) {
  await execa(
    "rollup", 
    [
      "-cw", 
      "--environment", 
      `TARGET:${target}`
    ], 
    {
      stdio: "inherit", // 子进程的输出结果共享给父进程
    }
  );
}
