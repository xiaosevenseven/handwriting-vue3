import { hasChanged, isArray, isObject } from "@vue/shared"
import { track, trigger } from "./effect"
import { TrackOpTypes, TriggerOpTypes } from "./operators"
import { reactive } from "./reactive"

export function ref(value: any) {
  return createRef(value)
}

export function shallowRef(value: any) {
  return createRef(value, true)
}
const convert = (val: any): any => isObject(val) ? reactive(val) : val
class RefImpl {
  public _value: any
  public _v_isRef = true
  constructor(public rawValue: any, public shallow: boolean) {
    this._value = shallow ? rawValue : convert(rawValue)
  }
  get value() {
    track(this, TrackOpTypes.GET, 'value')
    return this._value
  }
  set value(newValue: any) {
    if (hasChanged(newValue, this.rawValue)) {
      this.rawValue = newValue
      this._value = this.shallow ? this.rawValue : convert(newValue)
      trigger(this, TriggerOpTypes.SET, 'value', newValue)
    }
  }
}
function createRef(rawValue: any, shallow = false) {
  return new RefImpl(rawValue, shallow)
}



class ObjectRefImpl {
  public __v_isRef = true
  constructor(public target: any, public key: any) { }
  get value() {
    return this.target[this.key]
  }
  set value(newValue: any) {
    this.target[this.key] = newValue
  }
}
export function toRef(target: any, key: any) {
  return new ObjectRefImpl(target, key)
}



export function toRefs(target: any) {
  const res: any = isArray(target) ? new Array(target.length) : {}
  for (let key in target) {
    res[key] = toRef(target, key)
  }
  return res
}