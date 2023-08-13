import { patchAttr } from "./modules/attr"
import { patchClass } from "./modules/class"
import { patchStyle } from "./modules/style"
import { patchEvents } from "./modules/events"


export const patchProp = (el: any, key: any, prevValue: any, nextValue: any) => {
  switch (key) {
    case 'class':
      patchClass(el, nextValue)
      break
    case 'style':
      patchStyle(el, prevValue, nextValue)
      break
    default:
      if (/^on[^a-z]/.test(key)) {
        patchEvents(el, key, nextValue)
      } else {
        patchAttr(el, key, nextValue)
      }
      break
  }
}