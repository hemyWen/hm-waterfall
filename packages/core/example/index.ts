import hmWaterfall from "../src/waterfall";
const getData = (page: number, pageSize: number) => {
  return new Promise((resolve) => {
    fetch(`http://localhost:3000/posts?_page=${page}&_per_page=${pageSize}`)
      .then((response) => response.json())
      .then((data) => resolve(data.data));
  });
};
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
  onCardClick: (item) => {
    alert(`你点击了----${item.title}`);
  },
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
