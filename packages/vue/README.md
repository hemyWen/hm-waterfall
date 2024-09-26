<div align="center">
<img src="https://raw.githubusercontent.com/hemyWen/hm-waterfall/master/assets/logo.png" width="50" height="50" />
<h2>hm-waterfall</h2>
<h5>数据列表瀑布流,支持响应式,自定义列数,虚拟列表</h5>

<table style="width:auto;display:table">
    <tr>
        <th>框架</th>
        <th>npm包</th>
        <th>安装</th>
    </tr>
    <tr>
        <td>JS/TS</td>
        <td><a href='https://www.npmjs.com/package/hm-waterfall'>hm-waterfall</a></td>
        <td >npm install hm-waterfall</td>
    </tr>
    <tr>
        <td>Vue</td>
        <td><a href='https://www.npmjs.com/package/@hm-waterfall/vue'>@hm-waterfall/vue</a></td>
        <td>npm install @hm-waterfall/vue</td>
    </tr>
      <tr>
        <td>Vue3</td>
        <td><a href='https://www.npmjs.com/package/@hm-waterfall/vue3'>@hm-waterfall/vue3</a></td>
        <td>npm install @hm-waterfall/vue3</td>
    </tr>
     <tr>
        <td>React</td>
        <td><a href='https://www.npmjs.com/package/@hm-waterfall/react'>@hm-waterfall/react</a></td>
        <td>npm install @hm-waterfall/react</td>
    </tr>
</table>
</div>

## 文档

- [JS/TS](https://github.com/hemyWen/hm-waterfall/tree/master/packages/core)
- [React](https://github.com/hemyWen/hm-waterfall/tree/master/packages/react)
- [Vue](https://github.com/hemyWen/hm-waterfall/tree/master/packages/vue)
- [Vue3](https://github.com/hemyWen/hm-waterfall/tree/master/packages/vue3)

### 效果

![Image text](https://raw.github.com/hemyWen/hm-waterfall/master/assets/demo1.jpg)

##### 支持响应式虚拟列表

![Image text](https://raw.github.com/hemyWen/hm-waterfall/master/assets/demo2.gif)

### 在 vue 中使用

```shell
npm i @hm-waterfall/vue
```

```js
import Watefall from '@hm-waterfall/vue'
export default {
  components: {
    Watefall
  },
  data() {
    return {
      columnNum: 2
    }
  },
  methods: {
    getData(page, pageSize) {
      return new Promise((resolve) => {
        fetch(`http://localhost:5000/getwaterfall?page=${page}&pageSize=${pageSize}`)
          .then((response) => response.json())
          .then((data) => resolve(data.data))
      })
    }
  }
}
```

```html
<Waterfall :request="getData" :column-num="columnNum" />
```

#### 增加卡片自定义底部信息

添加默认插槽
![Image text](https://raw.github.com/hemyWen/hm-waterfall/master/assets/demo3.jpg)

```html
<Waterfall :request="getData" :column-num="columnNum">
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
```

#### 卡片点击事件 onCardClick

点击卡片事件函数,接收一个当前卡片信息 item 参数

```html
<Waterfall :request="getData" :column-num="columnNum" @on-card-click="onCardClick" />
```

```js
onCardClick(item) {
  alert(`你点击了----${item.title}`)
}
```

##### API

<table>
 <tr>
    <th>属性名</th>
    <th>值类型</th>
    <th>描述</th>
    <th>是否必填</th>
    <th>默认值</th>
 </tr>
 <tr>
    <td>gap</td>
    <td>number</td>
    <td>间隔</td>
    <td>否</td>
    <td>16</td>
 </tr>
  <tr>
    <td>columnNum</td>
    <td>number</td>
    <td>列数</td>
    <td>否</td>
    <td>2</td>
 </tr>
  <tr>
    <td>pageSize</td>
    <td>number</td>
    <td>每页数量</td>
    <td>否</td>
    <td>50</td>
 </tr>
 <tr>
    <td>showLoading</td>
    <td>boolean</td>
    <td>是否显示加载图标</td>
    <td>否</td>
    <td>true</td>
 </tr>
 <tr>
    <td>request</td>
    <td>(page: number, pageSize: number) => Promise</td>
    <td>获取列表的异步函数,返回的数据中每个卡片数据必须包含width和height两个属性,卡片图片字段为url</td>
    <td>是</td>
    <td>/</td>
 </tr>
</table>

#### 插槽

<table>
  <tr>
      <th>插槽名</th>
      <th>描述</th>
  </tr>
  <tr>
      <td>default</td>
      <td>卡片底部描述信息</td>
  </tr>
  <tr>
      <td>loadingSlot</td>
      <td>加载更多</td>
  </tr>
  <tr>
      <td>backTopSlot</td>
      <td>回到顶部按钮</td>
  </tr>
 </table>

#### 事件

<table>
  <tr>
      <th>事件名</th>
      <th>类型</th>
  </tr>
  <tr>
      <td>onCardClick</td>
      <td>(item: IRenderItem) => void</td>
  </tr>

 </table>
