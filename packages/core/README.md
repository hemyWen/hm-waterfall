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

### 在 JS / TS 中使用

```html
<div class="list"></div>
```

##### 1.通过 cdn 引入

```js
<script src="https://unpkg.com/hm-waterfall@1.0.2"></script>;
//or
<script src="https://cdn.jsdelivr.net/npm/hm-waterfall@1.0.2"></script>;
```

```js

<script>
  const getData = (page, pageSize) => {
    return new Promise((resolve) => {
      fetch(`http://localhost:5000/getwaterfall?page=${page}&pageSize=${pageSize}`)
        .then((response) => response.json())
        .then((data) => resolve(data.data));
    });
  };
  const hw = new hmWaterfall(".list", {
    gap: 16,
    columnNum: 5,
    request: getData,
  });
</script>
```

##### 2.通过 import 引入

```sh
npm install hm-waterfall
```

```js
const hw = new hmWaterfall(".list", {
  gap: 16,
  columnNum: 5,
  request: getData,
});
```

##### 实例有一个设置列数的方法 setColumnNum(columnNum)

完成不同设备宽度下列数的变化

```js
 const getColumnNum = (width: number) => {
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
  const columnNum = getColumnNum(entries[0].target.clientWidth);
  hw.setColumnNum(columnNum);
});
resizeObserver.observe(document.querySelector(".list")!);
```

##### 自定义卡片底部信息

footer 函数接收一个当前卡片数据 item 函数,返回自定义 dom

![Image text](https://raw.github.com/hemyWen/hm-waterfall/master/assets/demo3.jpg)

```js
const hw = new hmWaterfall(".list", {
  gap: 16,
  columnNum: 5,
  request: getData,
  footer: (item) => {
    const div = document.createElement("div");
    div.classList.add("text-info");
    div.innerHTML = ` 
        <div class="text">${item.title}</div>
        <div class="info">
          <img src="${item.avatar}" style="width:20px; height:20px; border-radius:50%" />
          <span>${item.author}</span>
        </div>
      `;
    return div;
  },
});
```

##### 点击卡片事件

onCardClick 函数接收一个当前卡片数据 item

```js
const hw = new hmWaterfall(".list", {
  gap: 16,
  columnNum: 5,
  request: getData,
  onCardClick: (item) => {
    alert(`你点击了----${item.title}`);
  },
});
```

##### 自定义回到顶部和加载数据 dom

backTopSlot 函数返回自定义 dom
loadingSlot 函数返回自定义 dom

```js
const hw = new hmWaterfall(".list", {
  gap: 16,
  columnNum: 5,
  request: getData,
  backTopSlot: () => {
    const div = document.createElement("div");
    div.className = "back-top-btn";
    div.innerHTML = "↑";
    return div;
  },
  loadingSlot: () => {
    const div = document.createElement("div");
    div.innerHTML = "加载中...";
    return div;
  },
});
```

### API

```js
new hmWaterfall(selector, options);
```

##### selector

```html
<div class="list"></div>
//传入 .list 或者 document.querySelector(".list")
```

##### options

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
    <td>(page,pageSize)=>Promise</td>
    <td>获取列表的异步函数,返回的数据中每个卡片数据必须包含width和height两个属性,卡片图片字段为url</td>
    <td>是</td>
    <td>/</td>
 </tr>
 <tr>
    <td>footer</td>
    <td>(item:IRenderItem)=>DOM</td>
    <td>自定义卡片底部信息函数,函数接收一个卡片数据item参数,返回自定义dom</td>
    <td>否</td>
    <td>/</td>
 </tr>
 <tr>
    <td>onCardClick</td>
    <td>(item:IRenderItem)=>void</td>
    <td>点击卡片事件函数,函数接收一个当前点击的卡片数据item参数</td>
    <td>否</td>
    <td>/</td>
 </tr>
 <tr>
    <td>backTopSlot</td>
    <td>()=>DOM</td>
    <td>自定义生成回到顶部按钮函数,函数返回创建的dom</td>
    <td>否</td>
    <td>/</td>
 </tr>
 <tr>
    <td>loadingSlot</td>
    <td>()=>DOM</td>
    <td>自定义生成加载数据dom的函数</td>
    <td>否</td>
    <td>/</td>
 </tr>
</table>
