import { isObject } from "@vue/shared"
import { 
  mutableHandlers, 
  shallowReactiveHandlers, 
  readonlyHandlers, 
  shallowReadonlyHandlers 
} from "./baseHandlers"

export function reactive(target: object) {
  return createReactiveObject(target, false, mutableHandlers)
}

export function shallowReactive(target: object) {
  return createReactiveObject(target, false, shallowReactiveHandlers)
}

export function readonly(target: object) {
  return createReactiveObject(target, true, readonlyHandlers)
}

export function shallowReadonly(target: object) {
  return createReactiveObject(target, true, shallowReadonlyHandlers)
}

/**
 * 是不是仅读
 * 是不是深度
 * 柯里化
 */
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
export function createReactiveObject(target: any, isReadonly: boolean, baseHandlers: object) {
  // 如果目标不是对象，则无法进行拦截
  if (!isObject(target)) {
    return target
  }
  const proxyMap = isReadonly ? readonlyMap : reactiveMap
  const existProxy = proxyMap.get(target)
  if (existProxy) {
    // 如果已经被代理过了，直接返回
    return existProxy
  }
  const proxy = new Proxy(target, baseHandlers)
  proxyMap.set(target, proxy)
  return proxy
}