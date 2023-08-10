/**
 * 实现 new Proxy(target, baseHandlers)
 */
import { extend, hasOwn, isArray, isIntegerKey, isObject, hasChanged } from '@vue/shared'
import { track, trigger } from './effect'
import { reactive, readonly } from './reactive'
import { TrackOpTypes, TriggerOpTypes } from './operators'

function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  return function get(target: object, key: PropertyKey, receiver: any) {
    const res = Reflect.get(target, key, receiver)

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)
    }

    if (shallow) {
      return res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
function createSetter(shallow: boolean = false) {
  return function set(target: any, key: any, value: any) {
    const oldvalue = target[key];
    let hasKey: boolean = isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target, key)
    const res = Reflect.set(target, key, value)
    // 当数据更新时，通知对应属性的 effect 执行
    if (!hasKey) {
      // 新增属性
      trigger(target, TriggerOpTypes.ADD, key, value)
    } else if (hasChanged(oldvalue, value)) {
      // 修改属性值
      trigger(target, TriggerOpTypes.SET, key, value, oldvalue)
    }
    return res
  }
}

const get = createGetter()
const set = createSetter()
export const mutableHandlers: object = {
  get,
  set
}

const shallowGet = createGetter(false, true)
const shallowSet = createSetter(true)
export const shallowReactiveHandlers: object = {
  get: shallowGet,
  set, shallowSet
}


let readonlyObj = {
  set: (target: any, key: string) => {
    console.warn(`set ${target} on key ${key} failed`)
  }
}

const readonlyGet = createGetter(true)
export const readonlyHandlers: object = extend({
  get: readonlyGet,

}, readonlyObj)

const shallowReadonlyGet = createGetter(true, true)
// 仅第一层不能修改，后面的可以修改 
export const shallowReadonlyHandlers: object = extend({
  get: shallowReadonlyGet
}, readonlyObj)