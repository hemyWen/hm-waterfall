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

### 在 react 中使用

```shell
npm i @hm-waterfall/react
```

```jsx
import Watefall from "@hm-waterfall/react";
```

```jsx
function App() {
  const listRef = useRef<HTMLDivElement>(null);
  const [columnNum, setColumnNum] = useState(2);
  const getData = (page: number, pageSize: number) => {
    return new Promise((resolve) => {
      fetch(`http://localhost:5000/getwaterfall?page=${page}&pageSize=${pageSize}`)
        .then((response) => response.json())
        .then((data) => resolve(data.data));
    });
  };
  return (
    <div className="root">
      <div className="list" ref={listRef}>
        <Watefall
          request={getData}
          columnNum={columnNum}
        />
      </div>
    </div>
  );
}
</div>;
```

#### 增加卡片自定义底部信息

添加子组件,子组件接收一个当前卡片信息 item 参数,返回一个 ReactElement
![Image text](https://raw.github.com/hemyWen/hm-waterfall/master/assets/demo3.jpg)

```jsx
<Watefall request={getData} columnNum={columnNum} onCardClick={cardClick}>
  {(item: IRenderItem) => (
    <div className="text-info">
      <div className="text">{item.title}</div>
      <div className="info">
        <img src={item.avatar} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
        <span>{item.author}</span>
      </div>
    </div>
  )}
</Watefall>
```

#### 卡片点击事件 onCardClick

点击卡片事件函数,接收一个当前卡片信息 item 参数

```jsx
function cardClick(item: IRenderItem) {
  alert(`点击了========${item.title}`);
}
<Watefall request={getData} columnNum={columnNum} onCardClick={cardClick} />;
```

#### 自定义回到顶部和加载数据 loadingSlot backTopSlot

backTopSlot 函数返回自定义 ReactElement
loadingSlot 函数返回自定义 ReactElement

```jsx
const loadingSlot = <div className="loading">...</div>;
const backTopSlot = <div className="back-top-btn">↑</div>;

<Watefall
  request={getData}
  columnNum={columnNum}
  onCardClick={cardClick}
  loadingSlot={loadingSlot}
  backTopSlot={backTopSlot}
/>;
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
 <tr>
    <td>onCardClick</td>
    <td>(item: IRenderItem) => void</td>
    <td>点击卡片事件函数,函数接收一个当前点击的卡片数据item参数</td>
    <td>否</td>
    <td>/</td>
 </tr>
 <tr>
    <td>backTopSlot</td>
    <td>function(item: IRenderItem) => ReactElement</td>
    <td>自定义生成回到顶部按钮函数,函数返回创建的ReactElement</td>
    <td>否</td>
    <td>/</td>
 </tr>
 <tr>
    <td>loadingSlot</td>
    <td>function(item: IRenderItem) => ReactElement</td>
    <td>自定义生成加载更多的函数,函数返回创建的ReactElement</td>
    <td>否</td>
    <td>/</td>
 </tr>
</table>
