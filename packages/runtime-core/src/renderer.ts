import { effect } from "@vue/reactivity";
import { ShapeFlags } from "@vue/shared";
import { createAppAPI } from "./apiCreateApp";
import { createComponentInstance, setupComponent } from "./component";
import { queueJob } from "./scheduler";
import { normalizeVNode } from "./vnode";

export function createRenderer(rendererOptions: any) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateTextNode,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    nextSibling: hostNextSibling,
  } = rendererOptions;

  const setupRenderEffect = (instance: any, container: any) => {
    instance.update = effect(function componentEffect() {
      // 每个组件都有一个effect， vue3 是组件级更新，数据变  化会重新执行对应组件的 effect
      if (!instance.isMounted) {
        let proxyToUse = instance.proxy;
        let subTree = instance.render.call(proxyToUse, proxyToUse);
        patch(null, subTree, container);
        instance.isMounted = true;
      } else {
        // 更新逻辑 -- diff 算法
        const prevTree = instance.subTree;
        let proxy = instance.proxy;
        const nextTree = instance.render.call(proxy, proxy);
        patch(prevTree, nextTree, container);
      }
    }, {
      scheduler: queueJob
    });
  };
  function mountComponent(initialVnode: any, container: any) {
    // 获取组件实例
    // 需要的数据解析到实例上
    // 创建一个 effect 让 render 函数执行
    const instance = (initialVnode.component =
      createComponentInstance(initialVnode));
    setupComponent(instance);
    setupRenderEffect(instance, container);
  }
  function processComponent(n1: any, n2: any, container: any) {
    if (n1 == null) {
      mountComponent(n2, container);
    } else {
      // 组件更新流程
    }
  }
  function mountChildren(children: any, container: any) {
    for (let i = 0; i < children.length; i++) {
      let child = normalizeVNode(children[i]);
      patch(null, child, container);
    }
  }
  function mountElement(vnode: any, container: any, anchor: any = null) {
    const { props, shapeFlag, type, children } = vnode;
    let el = (vnode.el = hostCreateElement(type));
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }
    hostInsert(el, container, anchor);
  }
  function processElement(n1: any, n2: any, container: any, anchor: any = null) {
    if (n1 == null) {
      // 元素挂载
      mountElement(n2, container, anchor);
    } else {
      // 元素更新
      patchElement(n1, n2, container);
    }
  }
  function patchElement(n1: any, n2: any, container: any) {
    let el = (n2.el = n1.el);
    // 更新属性、更新儿子
    const oldProps = n1.props || {};
    const newProps = n2.props || {};
    patchProps(oldProps, newProps, el);
    patchChildren(n1, n2, container);
  }
  function patchProps(oldProps: any, newProps: any, el: any) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  }
  function patchChildren(n1: any, n2: any, el: any) {
    const c1 = n1.children;
    const c2 = n2.children;
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { // 现在是文本，之前是数组
      // 老的是 n 个孩子，但是新的是文本
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }
      if (c2 !== c1) {  // 两个都是文本
        hostSetElementText(el, c2);
      }
    } else {
      // 现在是元素，上一次可能是文本或者元素
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {  // 两个都是数组
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 当前是数组，之前是数组 / diff 算法
          patchKeyChildren(children, c2, el)
        } else {
          // 没有孩子，特殊情况，当前是 null， 删除掉老的
          unmountChildren(c1);
        }
      } else {
        // 上一次是文本
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) { // 现在是数组，之前是文本
          hostSetElementText(el, "");
        }
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  }
  function getSequence(arr: any[]) { 
    const len = arr.length;
    const result = [0]; // 默认索引为 0 的项为最长子序列
    const p = arr.slice(0); // 保存 arr 的拷贝
    let start;
    let end;
    let middle;
    for (let i = 0; i < len; i++) {
      const arrI = arr[i]
      if (arrI !== 0) {
        const resultLastIndex = result[result.length - 1];
        // 如果 arr[i] 比 arr 中最后一项大，直接 push 到 result 中
        if (arr[resultLastIndex] < arrI) {
          p[i] = resultLastIndex; // 保存 arr[i] 的前一个索引
          result.push(i); // 保存当前索引
          continue;
        }
        // 使用二分查找法在 result 数组中找到比 arr[i] 大的第一个数
        start = 0;
        end = result.length - 1;
        while (start < end) { // 二分查找
          middle = ((start + end) / 2) | 0; // 取整
          if (arr[result[middle]] < arrI) {
            start = middle + 1;
          } else {
            end = middle;
          }
        }
        if (arrI < arr[result[start]]) {
          if (start > 0) {
            p[i] = result[start - 1];
          }
          result[start] = i;
        }
      }
    }
    let len1 = result.length;
    let last = result[len1 - 1];
    // 回溯数组 p，把最长子序列找出来
    while (len1-- > 0) {
      result[len1] = last;
      last = p[last];
    }
    return result;
  }
  function patchKeyChildren(c1: any, c2: any, el: any) {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    // sync from start
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break
      }
      i++;
    }
    // sync from end
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVnodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break
      }
      e1--;
      e2--;
    }
    // 1. 有一方完成了，剩下的去处理
    if (i > e1) {
      // 老的少，新的多
      if (i <= e2) {  // 表示有新增的部分
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor); // 只会向后追加
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      // 乱序比较 - 尽可能服用，用新的元素做成一个映射表，一样的服用，不一样的要不插入，要不删除
      const s1 = i;
      const s2 = i;

      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {  // 将新的节点未处理的节点做成一个映射表
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      const toBePatched = e2 - s2 + 1;  // 新的有几个
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      // 去老的里面查找，看有没有复用的
      for (let i = s1; i < e1; i++) {
        const prevChild = c1[i];
        const newIndex = keyToNewIndexMap.get(prevChild.key);
        if (newIndex === undefined) {
          unmount(prevChild);
        } else {
          // 新的和旧的索引关系
          newIndexToOldIndexMap[newIndex - s2] = i + 1
          patch(prevChild, c2[newIndex], el);
        }
      }

      for (let i = toBePatched - 1; i >= 0; i--) {
        let currentIndex = i + s2 // 新的索引
        let child = c2[currentIndex]
        let anchor = currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;

        if (newIndexToOldIndexMap[i] === 0) {
          // 如果是 0 说明没有被 patch 过
          patch(null, child, el, anchor);
        } else {
          // 操作当前的 d 以 d 下一个作为参照物插入
          hostInsert(child.el, el, anchor);
        }
      }
    }
  }
  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  }
  function processText(n1: any, n2: any, container: any) {
    if (n1 == null) {
      // 创建文本
      hostInsert((n2.el = hostCreateTextNode(n2.children)), container);
    } else {
      // 文本更新
    }
  }
  const isSameVnodeType = (n1: any, n2: any) => {
    return n1.type === n2.type && n1.key === n2.key;
  };
  function unmount(vnode: any) {
    hostRemove(vnode.el);
  }
  function patch(n1: any, n2: any, container: any, anchor: any = {}) {
    const { shapeFlag, type } = n2;
    if (n1 && isSameVnodeType(n1, n2)) {
      // 把以前的删除，换成 n2
      anchor = hostNextSibling(n1.el)
      unmount(n1)
      n1 = null // 重新渲染 n2 对应的内容
    }
    switch (type) {
      case ShapeFlags.TEXT_CHILDREN:
        processText(n1, n2, container)
        break;
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          console.log("元素");
          processElement(n1, n2, container);
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          console.log("组件");
          processComponent(n1, n2, container);
        }
    }
  }
  const render = (vnode: any, container: any) => {
    // 根据不同的虚拟节点，创建对应的真实元素
    patch(null, vnode, container);
  };
  return {
    createApp: createAppAPI(render),
  };
}
