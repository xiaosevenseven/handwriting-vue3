import { isFunction, isObject, ShapeFlags } from "@vue/shared"
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
export function createComponentInstance(vnode: any) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    ctx: {},
    setupState: {},
    isMounted: false
  }
  instance.ctx = { _: instance }
  return instance
}

export function setupComponent(instance: any) {
  const { props, children } = instance.vnode
  instance.props = props
  instance.children = children

  // 判断当前是否是有状态组件，函数组件
  let isStateFul = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  if (isStateFul) {
    // 调用当前实例的 setup 方法
    setupStatefulComponent(instance)
  }
}

function setupStatefulComponent(instance: any) {
  // 代理 传递给 render 函数的参数
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers as any)
  let Component = instance.type
  let { setup } = Component
  if (setup) {
    let setupContext = createContext(instance)
    const setupResult = setup(instance.props, setupContext)
    handlerSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)  // 完成组件的启动
  }
  Component.render(instance.proxy)
}

function handlerSetupResult(instance: any, setupResult: any) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  // 优先使用 setup 返回的 render
  if (!instance.render) {
    // 对 template 模版进行编译，产生 render 函数
    let Component = instance.type
    if (!Component.render && Component.template) {
      // 将编译结果赋值给 Component.render
    }
    instance.render = Component.render
  }
}

function createContext(instance: any) {
  return {
    attrs: instance.attrs,
    porps: instance.porps,
    slots: instance.slots,
    emit: () => { },
    expose: () => { }
  }
}

/**
 * instance 表示组件的状态，组件的相关信息
 * context 就 4 个参数，是为了开发时使用的
 * proxy 主要是取值方便
 */