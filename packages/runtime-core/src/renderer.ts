
import { effect } from '@vue/reactivity'
import { ShapeFlags } from '@vue/shared'
import { createAppAPI } from './apiCreateApp'
import { createComponentInstance, setupComponent } from './component'

export function createRenderer(rendererOptions: any) {
  const setupRenderEffect = (instance: any, container: any) => {
    effect(function componentEffect() {
      // 每个组件都有一个effect， vue3 是组件级更新，数据变化会重新执行对应组件的 effect
      if (!instance.isMounted) {
        let proxyToUse = instance.proxy
        let subTree = instance.render.call(proxyToUse, proxyToUse)
        patch(null, subTree, container)
        instance.isMounted = true
      } else {
        // 更新逻辑
      }
    })

  }
  function mountComponent(initialVnode: any, container: any) {
    // 获取组件实例
    // 需要的数据解析到实例上
    // 创建一个 effect 让 render 函数执行
    const instance = (initialVnode.component = createComponentInstance(initialVnode))
    setupComponent(instance)
    setupRenderEffect(instance, container)
  }
  function processComponent(n1: any, n2: any, container: any) {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
      // 组件更新流程
    }
  }
  function patch(n1: any, n2: any, container: any) {
    const { shapeFlag } = n2
    if (shapeFlag & ShapeFlags.ELEMENT) {
      console.log('元素')
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      console.log('组件')
      processComponent(n1, n2, container)
    }
  }
  const render = (vnode: any, container: any) => {
    // 根据不同的虚拟节点，创建对应的真实元素
    patch(null, vnode, container)
  }
  return {
    createApp: createAppAPI(render)
  }
}