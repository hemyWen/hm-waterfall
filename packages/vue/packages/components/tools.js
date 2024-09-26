export function throttle (fn) {
  let lock = false
  return function (...args) {
    if (lock) return
    lock = true
    window.requestAnimationFrame(() => {
      fn.apply(this, args)
      lock = false
    })
  }
}
export function debounce (fn, delay = 1000) {
  let timer = null
  return function () {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, arguments)
    }, delay)
  }
}
