export function throttle(fn: any) {
  let lock = false;
  return function (this: any, ...args: any[]) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(this, args);
      lock = false;
    });
  };
}
export function debounce(fn: any, delay = 1000) {
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
const p = Promise.resolve();
export function nextTick(fn?: () => void): Promise<void> {
  return fn ? p.then(fn) : p;
}
