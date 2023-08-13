/**
 * 提供 DOM API，操作节点、操作属性的更新
 */

import { extend } from "@vue/shared";
import { nodeOps } from "./nodeOps";
import { patchProp } from './patchProp'
import { createRenderer } from "@vue/runtime-core";

const rendererOptions = extend({ patchProp }, nodeOps)

export function createApp(rootComponent: any, rootProps = null) {
  const app: any = createRenderer(rendererOptions).createApp(rootComponent, rootProps)
  let { mount } = app
  app.mount = function (container: any) {
    container = nodeOps.querySelector(container)
    container.innerHTML = ''
    mount(container)
  }
  return app
}