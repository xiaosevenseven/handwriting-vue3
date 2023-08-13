import { ShapeFlags, isObject, isString, isArray } from '@vue/shared'

export const createVNode = (type: any, props: any, children?: any) => {

  const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    el: null, // 虚拟节点对应的真实节点
    component: null,  // 存在组件的实例
    key: props && props.key,  //  diff 算法会用到 key
    shapeFlag // 判断当前自己的类型和儿子的类型
  }
  normalizeChildren(vnode, children)
  return vnode
}

function normalizeChildren(vnode: any, children: any) {
  let type = 0;
  if (children == null) {

  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else {
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.shapeFlag |= type
}


export function isVnode(value: any) {
  return value.__v_isVnode
}