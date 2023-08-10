/**
 * 把 packages 目录下所有包都进行打包
 */

const fs = require("fs");
const execa = require("execa"); // 开启子进程进行打包

// 获取所有的包名
const targets = fs.readdirSync("packages").filter((f) => {
  if (fs.statSync(`packages/${f}`).isDirectory()) {
    return true;
  } else {
    return false;
  }
});

runParallel(targets, build);
async function runParallel(source, iteratorFn) {
  const res = [];
  for (const item of source) {
    const p = iteratorFn(item);
    res.push(p);
  }
  return Promise.all(res);
}
async function build(target) {
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit", // 子进程的输出结果共享给父进程
  });
}
