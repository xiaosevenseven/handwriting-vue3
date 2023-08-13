export const patchStyle = (el: any, prev: any, next: any) => {
  const style = el.style
  if (next == null) {
    el.removeAttribute('style')
  } else {
    if (prev) {
      for (let key in prev) {
        if (next[key] == null) {
          style[key] = ''
        }
      }
    }
    for (let key in next) {
      style[key] = next[key]
    }
  }
}