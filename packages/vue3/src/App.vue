<template>
  <div class="root">
    <div class="list" ref="listRef">
      <Waterfall :request="getData" :column-num="columnNum" @on-card-click="cardClick">
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
<script setup lang="ts">
import type { IRenderItem } from "../packages/components/type";
import Waterfall from "../packages/components/Waterfall.vue";
import { onMounted, ref } from "vue";
const columnNum = ref<number>(2);
const listRef = ref<HTMLDivElement | null>(null);

const getColumnNum = (width: number): number => {
  if (width > 960) {
    return 5;
  } else if (width >= 690 && width < 960) {
    return 4;
  } else if (width >= 500 && width < 690) {
    return 3;
  } else {
    return 2;
  }
};
const resizeObserver = new ResizeObserver((entries) => {
  columnNum.value = getColumnNum(entries[0].target.clientWidth);
});
const getData = (page: number, pageSize: number) => {
  return new Promise((resolve) => {
    fetch(`http://localhost:5000/getwaterfall?page=${page}&pageSize=${pageSize}`)
      .then((response) => response.json())
      .then((data) => resolve(data.data));
  });
};
const cardClick = (item: IRenderItem) => {
  alert(`你点击了----${item.title}`);
};
onMounted(() => {
  listRef.value && resizeObserver.observe(listRef.value);
});
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
