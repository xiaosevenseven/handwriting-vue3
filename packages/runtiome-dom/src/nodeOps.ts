
export const nodeOps = {
  // 元素操作
  createElement: (tagName: any) => document.createElement(tagName),
  remove: (child: { parentNode: any }) => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  insert: (
    child: any,
    parent: {
      insertBefore: (arg0: any, arg1: null) => void
    }, anchor = null) => {
    parent.insertBefore(child, anchor)
  },
  querySelector: (selector: any) => document.querySelector(selector),
  setElementText: (el: { textContent: any }, text: any) => el.textContent = text,
  createText: (text: any) => document.createTextNode(text),
  setText: (node: { nodeValue: any }, text: any) => node.nodeValue = text,
  nextSibling: (node: { nextSibling: any }) => node.nextSibling,
}