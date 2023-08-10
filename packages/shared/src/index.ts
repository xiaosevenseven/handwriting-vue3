
export const isObject = (val: any): boolean => val !== null && typeof val === 'object';
export const extend = Object.assign;
export const isArray = Array.isArray;
export const isFunction = (val: any): val is Function => typeof val === 'function';
export const isNumber = (val: any): val is number => typeof val === 'number';
export const isString = (val: any): val is string => typeof val === 'string';
export const isIntegerKey = (key: any) => parseInt(key) + '' === key;
export const hasOwn = (target: object, key: string | symbol) => Object.prototype.hasOwnProperty.call(target, key);
export const hasChanged = (oldValue: any, newValue: any) => oldValue !== newValue;