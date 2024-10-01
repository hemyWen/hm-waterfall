<template>
  <div ref="waterfall-container" class="hm_waterfall-container" @scroll="handleScroll">
    <div ref="container" class="hm_container">
      <div
        v-for="item in renderList"
        :ref="item.ref"
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
            backgroundSize: '100% 100%'
          }"
        />
        <div :ref="'item_' + item.idx" :style="{ width: item.width + 'px' }">
          <slot :item="item" />
        </div>
      </div>
      <div v-if="showLoading && isLoadNextPage" ref="loading" class="hm_waterfall-loading">
        <slot name="loadingSlot">加载中...</slot>
      </div>
      <div v-if="isShowToTop" class="hm_waterfall-back-top">
        <slot name="backTopSlot" />
      </div>
    </div>
  </div>
</template>
<script>
import { throttle, debounce } from './tools'

export default {
  name: 'HmWaterfall',
  props: {
    pageSize: {
      type: Number,
      default: 50
    },
    request: {
      type: Function,
      default: () => {}
    },
    //间隔宽度
    gap: {
      type: Number,
      default: 16
    },
    //是否显示加载图标
    showLoading: {
      type: Boolean,
      default: true
    },
    columnNum: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      waterfallcontainerRef: null,
      containerRef: null,
      columnWidth: 0, //每列宽度
      page: 1,
      list: [],
      positionList: [], //列数据
      domDataList: [],
      screenOffset: 0,
      isLoadNextPage: false,
      isShowToTop: false,
      hasNextPage: true,
      resizeObserver: null,
      lastOffsetWidth: 0
    }
  },
  computed: {
    renderList() {
      const list = this.domDataList.filter((item) => item.show)
      return list
    }
  },
  watch: {
    columnNum() {
      this.handleResize()
    }
  },
  beforeDestroy() {
    this.resizeObserver.disconnect()
  },
  async mounted() {
    this.waterfallcontainerRef = this.$refs['waterfall-container']
    this.containerRef = this.$refs['container']
    this.screenOffset = this.waterfallcontainerRef.offsetHeight / 2
    this.computeColumnWidth()
    this.initPositionList()
    this.computeDomData(await this.getList(), 0)
    this.lastOffsetWidth = this.waterfallcontainerRef.offsetWidth
    this.resizeObserver = new ResizeObserver((entries) => {
      //避免初始化就运行问题
      if (entries[0].borderBoxSize[0].inlineSize !== this.lastOffsetWidth) {
        this.handleResize()
      }
    })
    this.resizeObserver.observe(this.waterfallcontainerRef)
  },

  methods: {
    handleResize: debounce(function () {
      this.resizeFn()
    }, 150),
    resizeFn() {
      this.computeColumnWidth()
      this.lastOffsetWidth = this.waterfallcontainerRef.offsetWidth
      this.initPositionList()
      this.computeDomData(this.list, 0, true)
    },
    handleScroll: throttle(async function () {
      const scrollTop = this.waterfallcontainerRef.scrollTop
      this.isShowToTop = scrollTop >= window.innerHeight
      this.updatePos()
      if (this.isLoadNextPage || !this.hasNextPage) {
        return false
      }
      if (
        this.waterfallcontainerRef.scrollTop + this.waterfallcontainerRef.offsetHeight >=
        this.waterfallcontainerRef.scrollHeight * 0.85
      ) {
        this.isLoadNextPage = true
        this.page++
        const list = await this.getList()
        this.isLoadNextPage = false
        const startIdx = (this.page - 1) * this.pageSize
        this.computeDomData(list, startIdx)
      }
    }),
    //计算每一列宽度
    computeColumnWidth() {
      const allGapLength = (this.columnNum - 1) * this.gap
      this.columnWidth = (this.containerRef.offsetWidth - allGapLength) / this.columnNum
      return this.columnWidth
    },
    //重置每列数据
    initPositionList() {
      this.positionList = []
      for (let i = 0; i < this.columnNum; i++) {
        this.positionList.push({
          columnIdx: i + 1, //第几列
          columnHeight: 0 //对应高
        })
      }
    },
    computeDomData(list, startIdx = 0, isReSize = false) {
      const length = list.length
      for (let i = 0; i < length; i++) {
        const item = list[i]
        const idx = i + startIdx
        const imageHeight = (item.height * this.columnWidth) / item.width
        const param = {
          ...item,
          idx,
          columnIdx: 0,
          ref: 'item_' + idx,
          imageHeight,
          height: imageHeight,
          width: this.columnWidth,
          top: 0,
          left: 0,
          show: true,
          style: {
            width: this.columnWidth + 'px',
            height: imageHeight + 'px'
          }
        }

        if (isReSize) {
          this.$set(this.domDataList, i, { ...param })
        } else {
          this.domDataList.push(param)
        }
      }
      this.$nextTick(() => {
        this.setCardPos(startIdx)
      })
    },
    setCardPos(startIdx) {
      const length = this.domDataList.length
      const end = startIdx === 0 ? length : startIdx + this.pageSize
      const endIdx = end <= length ? end : length
      for (let i = startIdx; i < endIdx; i++) {
        const domItem = this.domDataList[i]
        const { idx, imageHeight, width } = domItem
        const param = {
          ...domItem
        }
        const footer_slot = this.$refs['item_' + idx]
        const footer_height = footer_slot ? footer_slot[0].offsetHeight : 0
        const height = imageHeight + footer_height
        this.positionList.sort((a, b) => a.columnHeight - b.columnHeight)
        const minColumn = this.positionList[0]
        const { columnIdx, columnHeight } = minColumn
        const top = columnHeight
        const left = (columnIdx - 1) * (this.columnWidth + this.gap)
        param.columnIdx = columnIdx
        param.top = top
        param.left = left
        param.height = height
        param.style = {
          width: width + 'px',
          height: height + 'px',
          transform: `translate(${left}px,${top}px)`
        }
        param.show = this.checkIsRender(param)
        this.positionList[0].columnHeight += height + this.gap
        this.$set(this.domDataList, i, { ...domItem, ...param })
      }
      this.setContainerHeight()
    },
    updatePos() {
      this.domDataList.forEach((item, index) => {
        this.domDataList[index].show = this.checkIsRender(item)
      })
    },
    checkIsRender(params) {
      const { top, height } = params
      const y = top + height
      const topLine = this.waterfallcontainerRef.scrollTop - this.screenOffset
      const bottomLine =
        this.waterfallcontainerRef.scrollTop + this.waterfallcontainerRef.offsetHeight + this.screenOffset
      const overTopLine = y < topLine
      const underBottomLine = top > bottomLine
      return !overTopLine && !underBottomLine
    },
    setContainerHeight() {
      const loadingHeight = this.showLoading ? 32 : 0
      this.positionList.sort((a, b) => a.columnHeight - b.columnHeight)
      this.containerRef.style.height =
        this.positionList[this.positionList.length - 1].columnHeight + loadingHeight + 'px'
    },
    getColumnNum(boxWidth) {
      if (boxWidth > 1600) {
        return 5
      } else if (boxWidth > 1200) {
        return 4
      } else if (boxWidth >= 768) {
        return 3
      } else {
        return 2
      }
    },
    async getList() {
      try {
        const nextList = await this.request(this.page, this.pageSize)
        this.hasNextPage = !!nextList.length && nextList.length === this.pageSize
        this.list = this.page === 1 ? nextList : this.list.concat(nextList)
        return nextList
      } catch (error) {
        this.$emit('on-fail-request')
      }
    },
    cardClick(item) {
      this.$emit('on-card-click', item)
    }
  }
}
</script>
<style scoped>
@import './waterfall.css';
</style>
