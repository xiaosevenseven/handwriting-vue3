import { isFunction } from '@vue/shared'
import { effect, track, trigger } from './effect'
import { TrackOpTypes, TriggerOpTypes } from './operators'

class ComputedRefImpl {
  public _dirty: boolean = true  // 默认取值时不要用缓存
  public _value: any
  public effect: Function
  constructor(getter: Function, public setter: Function) {
    this.effect = effect(getter, {
      lazy: true, // 默认不执行
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          // 属性更新时，触发更新
          trigger(this, TriggerOpTypes.SET, 'value')
        }
      }
    })
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  set value(newValue) {
    this.setter(newValue)
  }
}




export function computed(getterOrOptions: Function | { get: Function, set: Function }) {
  let getter: Function;
  let setter: Function;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => { console.warn('computed value must be readonly') }
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }
  return new ComputedRefImpl(getter, setter)
}