import HmWaterfall from "./components/Waterfall.vue";
import type { App } from "vue";
export default {
  install(app: App) {
    app.component("HmWaterfall", HmWaterfall);
  },
};
