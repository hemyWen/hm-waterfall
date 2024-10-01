<template>
  <div ref="waterfallContainerRef" class="hm_waterfall-container" @scroll="handleScroll">
    <div ref="containerRef" class="hm_container">
      <div
        v-for="item in renderList"
        :key="item.idx"
        class="hm_waterfall-item"
        :style="item.style"
        @click="cardClick(item)"
      >
        <div
          class="hm_waterfall-item-main"
          :style="{
            height: item.imageHeight + 'px',
            backgroundImage: 'url(' + item.url + ')',
            backgroundSize: '100% 100%',
          }"
        />
        <div :ref="(el: any) => getSlotRefs(el, item.idx)" :style="{ width: item.width + 'px' }">
          <slot :item="item" />
        </div>
      </div>
      <div v-if="props.showLoading && isLoadNextPage" ref="loading" class="hm_waterfall-loading">
        <slot name="loadingSlot">加载中...</slot>
      </div>
      <div v-if="isShowToTop" class="hm_waterfall-back-top">
        <slot name="backTopSlot" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: "Waterfall",
};
</script>
<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted, toRaw, watch } from "vue";
import type { ICardItem, IPosItem, IRenderItem, IWaterfallProps } from "./type";
import { throttle, debounce } from "./tools";
const props = withDefaults(defineProps<IWaterfallProps>(), {
  gap: 16,
  pageSize: 50,
  showLoading: true,
  columnNum: 2,
  request: () => new Promise((resolve) => resolve([])),
});
const emit = defineEmits(["on-fail-request", "on-card-click"]);

const waterfallContainerRef = ref<HTMLDivElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const slotRefs = ref<{ [key: number]: HTMLDivElement }>({});

const columnWidth = ref(0);
const page = ref(1);
const screenOffset = ref(0);
const list = ref<ICardItem[]>([]);
const positionList = ref<IPosItem[]>([]);
const domDataList = ref<IRenderItem[]>([]);

const isLoadNextPage = ref(false);
const isShowToTop = ref(false);
const hasNextPage = ref(true);
const lastOffsetWidth = ref(0);

const getSlotRefs = (el: HTMLDivElement, idx: number) => {
  if (el) {
    slotRefs.value[idx] = el;
  }
  return el;
};
const renderList = computed(() => domDataList.value.filter((i) => i.show));

const resizeObserver = new ResizeObserver((entries) => {
  //避免初始化就运行
  if (entries[0].borderBoxSize[0].inlineSize !== lastOffsetWidth.value) {
    handleResize();
  }
});
watch(
  () => props.columnNum,
  () => {
    handleResize();
  }
);

const handleResize = debounce(function () {
  resizeFn();
}, 150);
const resizeFn = () => {
  computeColumnWidth();
  lastOffsetWidth.value = waterfallContainerRef.value!.offsetWidth;
  initPositionList();
  computeDomData(list.value, 0, true);
};
const handleScroll = throttle(async () => {
  const scrollTop = waterfallContainerRef.value!.scrollTop;
  isShowToTop.value = scrollTop >= window.innerHeight;
  updatePos();
  if (isLoadNextPage.value || !hasNextPage.value) {
    return false;
  }
  if (
    waterfallContainerRef.value!.scrollTop + waterfallContainerRef.value!.offsetHeight >=
    waterfallContainerRef.value!.scrollHeight * 0.85
  ) {
    isLoadNextPage.value = true;
    page.value++;
    const nextList = await getList();
    isLoadNextPage.value = false;
    const startIdx = (page.value - 1) * props.pageSize;
    computeDomData(nextList, startIdx);
  }
});
const initPositionList = () => {
  positionList.value = [];
  for (let i = 0; i < props.columnNum; i++) {
    positionList.value.push({
      columnIdx: i + 1, //第几列
      columnHeight: 0, //对应高
    });
  }
};
//计算每一列宽度
const computeColumnWidth = () => {
  const columnNum = props.columnNum;
  const allGapLength = (columnNum - 1) * props.gap;
  columnWidth.value = (containerRef.value!.offsetWidth - allGapLength) / columnNum;
};
const computeDomData = (list: ICardItem[], startIdx: number = 0, isReSize = false) => {
  const length = list.length;
  for (let i = 0; i < length; i++) {
    const item = list[i];
    const idx = i + startIdx;
    const imageHeight = (item.height * columnWidth.value) / item.width;
    const param = {
      ...item,
      idx,
      columnIdx: 0,
      imageHeight,
      height: imageHeight,
      width: columnWidth.value,
      top: 0,
      left: 0,
      show: true,
      url: item.url || "",
      style: {
        width: columnWidth.value + "px",
        height: imageHeight + "px",
      },
    };
    if (isReSize) {
      domDataList.value[i] = param;
    } else {
      domDataList.value.push(param);
    }
  }
  nextTick(() => {
    setCardPos(startIdx);
  });
};
const setCardPos = (startIdx: number) => {
  const length = domDataList.value.length;
  const end = startIdx === 0 ? length : startIdx + props.pageSize;
  const endIdx = end <= length ? end : length;
  for (let i = startIdx; i < endIdx; i++) {
    const domItem = domDataList.value[i];
    const { idx, imageHeight, width } = domItem;
    const param: ICardItem = {
      ...domItem,
    };
    const footer_height = slotRefs.value[idx] ? slotRefs.value[idx].offsetHeight : 0;
    const height = imageHeight + footer_height;
    positionList.value.sort((a, b) => a.columnHeight - b.columnHeight);
    const minColumn = positionList.value[0];
    const { columnIdx, columnHeight } = minColumn;
    const top = columnHeight;
    const left = (columnIdx - 1) * (columnWidth.value + props.gap);
    param.columnIdx = columnIdx;
    param.top = top;
    param.left = left;
    param.height = height;
    param.style = {
      width: width + "px",
      height: height + "px",
      transform: `translate(${left}px,${top}px)`,
    };
    param.show = checkIsRender(param);
    positionList.value[0].columnHeight += height + props.gap;
    domDataList.value[i] = { ...domItem, ...param };
  }
  setContainerHeight();
};
const updatePos = () => {
  domDataList.value.forEach((item, index) => {
    domDataList.value[index].show = checkIsRender(item);
  });
};
const setContainerHeight = () => {
  const loadingHeight = props.showLoading ? 32 : 0;
  positionList.value.sort((a, b) => a.columnHeight - b.columnHeight);
  containerRef.value!.style.height =
    positionList.value[positionList.value.length - 1].columnHeight + loadingHeight + "px";
};
const checkIsRender = (params: ICardItem) => {
  const { top, height } = params;
  const y = top + height;
  const topLine = waterfallContainerRef.value!.scrollTop - screenOffset.value;
  const bottomLine =
    waterfallContainerRef.value!.scrollTop + waterfallContainerRef.value!.offsetHeight + screenOffset.value;
  const overTopLine = y < topLine;
  const underBottomLine = top > bottomLine;
  return !overTopLine && !underBottomLine;
};
const getList = async () => {
  try {
    const nextList = await props.request(page.value, props.pageSize);
    hasNextPage.value = !!nextList.length && nextList.length === props.pageSize;
    list.value = page.value === 1 ? nextList : list.value.concat(nextList);
    return nextList;
  } catch (error) {
    emit("on-fail-request");
  }
};
const cardClick = (item: IRenderItem) => {
  emit("on-card-click", toRaw(item));
};
const init = async () => {
  screenOffset.value = waterfallContainerRef.value!.offsetHeight / 2;
  lastOffsetWidth.value = waterfallContainerRef.value!.offsetWidth;
  resizeObserver.observe(waterfallContainerRef.value!);
  computeColumnWidth();
  initPositionList();
  computeDomData(await getList(), 0);
};
onMounted(() => {
  init();
});
onUnmounted(() => {
  resizeObserver.disconnect();
});
</script>
<style scoped>
@import "./waterfall.css";
</style>
