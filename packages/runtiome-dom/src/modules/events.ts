export const patchEvents = (el: any, key: any, value: any) => {
  // 对函数的缓存
  const invokers = el._vei || (el._vei = {})
  const exists = invokers[key]
  if (value && exists) {  // 如果存在则绑定事件
    exists.value = value
  } else {
    const eventName = key.slice(2).toLowerCase()
    if (value) {  // 以前未绑定，新增事件
      let invoker = invokers[eventName] = createInvoker(value)
      el.addEventListener(eventName, invoker)
    } else { // 以前已绑定
      el.removeEventListener(eventName, exists)
      invokers[eventName] = undefined
    }
  }
}

function createInvoker(value: any) {
  const invoker = (e: any) => invoker.value(e)
  invoker.value = value
  return invoker
}