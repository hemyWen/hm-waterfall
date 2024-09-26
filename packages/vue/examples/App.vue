<template>
  <div class="root">
    <div ref="list" class="list">
      <Waterfall :request="getData" :column-num="columnNum" @on-card-click="onCardClick">
        <template #default="{ item }">
          <div class="text-info">
            <div class="text">{{ item.title }}</div>
            <div class="info">
              <img :src="item.avatar" class="avatar" />
              <span>{{ item.author }}</span>
            </div>
          </div>
        </template>
      </Waterfall>
    </div>
  </div>
</template>
<script>
import Waterfall from '../packages/components/Waterfall.vue'
export default {
  name: 'App',
  components: {
    Waterfall
  },
  data() {
    return {
      columnNum: 2,
      listRef: null,
      resizeObserver: null
    }
  },
  mounted() {
    this.listRef = this.$refs.list
    this.resizeObserver = new ResizeObserver((entries) => {
      this.columnNum = this.getColumnNum(entries[0].target.clientWidth)
    })
    this.resizeObserver.observe(this.listRef)
  },
  beforeDestroy() {
    this.resizeObserver.disconnect()
  },
  methods: {
    getColumnNum(width) {
      if (width > 960) {
        return 5
      } else if (width >= 690 && width < 960) {
        return 4
      } else if (width >= 500 && width < 690) {
        return 3
      } else {
        return 2
      }
    },
    getData(page, pageSize) {
      return new Promise((resolve) => {
        fetch(`http://localhost:5000/getwaterfall?page=${page}&pageSize=${pageSize}`)
          .then((response) => response.json())
          .then((data) => resolve(data.data))
      })
    },
    onCardClick(item) {
      alert(`你点击了----${item.title}`)
    }
  }
}
</script>
<style scoped>
.root {
  width: 100%;
  height: 100vh;
}

.list {
  width: 100%;
  height: 100%;
  background-color: #eee;
}
.text-info {
  padding: 12px;
  font-size: 14px;
}
.info {
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 10px;
  letter-spacing: 0;
}
.avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
</style>
