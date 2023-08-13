import { createVNode } from './vnode'

export function createAppAPI(render: Function) {
  return function createApp(rootComponent: any, rootProps: any) {
    const app = {
      _props: rootProps,
      _component: rootComponent,
      _container: null,
      mount(container: any) {
        // 根据组件创建虚拟节点
        // 将虚拟节点和容器获取到后调用 render 方法进行渲染
        const vnode = createVNode(rootComponent, rootProps)
        render(vnode, container)
        app._container = container
      }
    }
    return app
  }
}