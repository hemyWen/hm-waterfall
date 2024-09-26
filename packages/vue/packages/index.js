import HmWaterfall from './components/Waterfall.vue'

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.component('HmWaterfall', HmWaterfall)
}
HmWaterfall.install = function (Vue) {
  Vue.component(HmWaterfall.name, HmWaterfall)
}

export default HmWaterfall