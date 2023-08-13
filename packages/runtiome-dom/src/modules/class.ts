export const patchClass = (el: any, value: any) => {
  if (value == null) {
    value = ''
  }
  el.className = value
}