import { isArray, isIntegerKey } from "@vue/shared";
import { TriggerOpTypes, TrackOpTypes } from "./operators";

interface EffectOptions {
  lazy?: boolean,
  scheduler?: Function
}

let uid: number = 0;
let activeEffect: Function | undefined
const effectStack: (Function | undefined)[] = []
export function effect(fn: Function, options: EffectOptions = {}) {
  const effect: Function = createReactiveEffect(fn, options)

  if (!options.lazy) {
    effect()
  }
  return effect
}

function createReactiveEffect(fn: Function, options: EffectOptions) {
  const effect = function reactiveEffect() {
    if (!effectStack.includes(effect)) {
      // 防止递归执行, 防止 effect 函数中存在 xxx.xxx++ 导致死循环
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn(); // 函数执行时会取值，执行 get 方法
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++
  effect._isEffect = true // 用于标识这个是响应式 effect
  effect.raw = fn;
  effect.options = options
  return effect
}

// 让某个对象的属性，收集当前它对应的 effect 函数
const targetMap = new WeakMap()
export function track(target: object, type: TrackOpTypes, key: PropertyKey) {
  if (activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}

export function trigger(target: any, type: any, key?: any, newValue?: any, oldValue?: undefined) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return
  }

  const effects = new Set
  const add = (effectsToAdd: Set<Function> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => effects.add(effect))
    }
  }

  if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep: Set<Function> | undefined, key: string | number) => {
      if (key === 'length' || key > newValue) {
        // 更改后的长度小于当前收集的索引，那么这个索引也需要触发 effect 重新执行
        add(dep)
      }
    })
  } else {
    if (key !== undefined) {
      add(depsMap.get(key))
    }
    switch (type) {
      case TriggerOpTypes.ADD:
        if (isArray(target) && isIntegerKey(key)) {
          // 数组添加一个索引，触发更新
          add(depsMap.get('length'))
        }
        break;
    }
  }
  effects.forEach((effect: any) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}