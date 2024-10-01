

import HmWaterfall from './components/Waterfall.vue'
import _Vue from 'vue'

HmWaterfall.install = (Vue) => {
  if (!Vue) {
    window.Vue = Vue = _Vue
  } else {
    Vue.component(HmWaterfall.name, HmWaterfall)
  }
}

export default HmWaterfall
