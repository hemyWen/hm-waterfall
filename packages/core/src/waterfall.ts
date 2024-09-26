import { ICardItem, IPosItem, IRenderItem, IWaterfallProps } from "./types";
import { throttle, debounce, nextTick } from "./tools";
export default class Waterfall {
  element: HTMLDivElement;
  gap: number;
  columnNum: number;
  pageSize: number;
  //是否显示加载图标
  showLoading: boolean;
  request: (page: number, pageSize: number) => Promise<any>;
  footer: ((item: IRenderItem) => HTMLDivElement) | null;
  backTopSlot: (() => HTMLDivElement) | null;
  loadingSlot: (() => HTMLDivElement) | null = null;
  onCardClick: ((item: IRenderItem) => void) | null = null;

  waterfallContainer: HTMLDivElement | null = null;
  container: HTMLDivElement | null = null;
  loadingContainer: HTMLDivElement | null = null;
  backTopContainer: HTMLDivElement | null = null;
  columnWidth: number = 0;
  page: number = 1;
  screenOffset: number = 0;
  list: ICardItem[] = [];
  positionList: IPosItem[] = [];
  domDataList: IRenderItem[] = [];
  isLoadNextPage: boolean = false;
  isShowToTop: boolean = false;
  hasNextPage: boolean = true;
  lastOffsetWidth: number = 0;

  constructor(element: HTMLDivElement | string, config: IWaterfallProps) {
    this.element = typeof element === "string" ? (document.querySelector(element) as HTMLDivElement) : element;
    const {
      gap = 10,
      columnNum,
      pageSize = 50,
      showLoading = true,
      request,
      footer,
      onCardClick,
      backTopSlot,
      loadingSlot,
    } = config;
    this.gap = gap;
    this.columnNum = columnNum;
    this.pageSize = pageSize;
    this.showLoading = showLoading;
    this.request = request;
    this.footer = footer ? footer : null;
    this.onCardClick = onCardClick ? onCardClick : null;
    this.backTopSlot = backTopSlot ? backTopSlot : null;
    this.loadingSlot = loadingSlot ? loadingSlot : null;
    this.init(element);
  }
  private async init(element: HTMLDivElement | string) {
    if (!this.element) {
      throw new Error("Container does not exist: " + element);
    }
    this.initDom();
    const resizeObserver = new ResizeObserver((entries) => {
      //避免初始化就运行
      if (entries[0].borderBoxSize[0].inlineSize !== this.lastOffsetWidth) {
        this.handleResize();
      }
    });
    resizeObserver.observe(this.waterfallContainer!);
    this.computeColumnWidth();
    this.initPositionList();
    this.screenOffset = this.waterfallContainer!.offsetHeight / 2;
    this.lastOffsetWidth = this.waterfallContainer!.offsetWidth;
    this.computeDomData(await this.getList(), 0);
  }
  private initDom() {
    this.container = this.createDom("hm_container");
    this.waterfallContainer = this.createDom("hm_waterfall-container");
    this.loadingContainer = this.createDom("hm_waterfall-loading");
    this.loadingContainer.innerHTML = "加载中...";
    this.loadingContainer!.style.display = "none";
    this.loadingSlot && this.loadingContainer.appendChild(this.loadingSlot());
    this.backTopContainer = this.createDom("hm_waterfall-back-top");
    this.backTopContainer.style.display = "none";
    this.backTopSlot && this.backTopContainer.appendChild(this.backTopSlot());
    this.backTopContainer.addEventListener("click", this.backtoTop.bind(this));
    this.waterfallContainer.appendChild(this.container);
    this.showLoading && this.waterfallContainer.appendChild(this.loadingContainer);
    this.waterfallContainer.appendChild(this.backTopContainer);
    this.waterfallContainer.addEventListener("scroll", this.handleScroll.bind(this));
    this.element.appendChild(this.addStyle());
    this.element.appendChild(this.waterfallContainer);
  }
  private createDom(className: string, tagName: string = "div"): HTMLDivElement {
    const dom = document.createElement(tagName);
    dom.className = className;
    return dom as HTMLDivElement;
  }
  private backtoTop() {
    this.waterfallContainer!.scrollTo({
      left: 0,
      top: 0,
      behavior: "smooth",
    });
  }
  private handleScroll = throttle(async () => {
    const scrollTop = this.waterfallContainer!.scrollTop;
    this.isShowToTop = scrollTop >= window.innerHeight;
    if (this.isShowToTop) {
      this.backTopContainer!.style.display = "block";
    } else {
      this.backTopContainer!.style.display = "none";
    }
    this.updatePos();
    if (this.isLoadNextPage || !this.hasNextPage) {
      return false;
    }
    if (
      this.waterfallContainer!.scrollTop + this.waterfallContainer!.offsetHeight >=
      this.waterfallContainer!.scrollHeight * 0.85
    ) {
      this.isLoadNextPage = true;
      this.loadingContainer!.style.display = "block";
      this.page++;
      const nextList = await this.getList();
      this.isLoadNextPage = false;
      this.loadingContainer!.style.display = "none";
      const startIdx = (this.page - 1) * this.pageSize;
      this.computeDomData(nextList, startIdx);
    }
  });
  private handleResize = debounce(() => {
    this.resizeFn();
  }, 150);
  private resizeFn() {
    this.computeColumnWidth();
    this.lastOffsetWidth = this.waterfallContainer!.offsetWidth;
    this.initPositionList();
    this.domDataList = [];
    this.computeDomData(this.list, 0);
  }
  private renderDom(item: IRenderItem) {
    const { show, idx, width, height, left, top, imageHeight, url } = item;
    const dom = this.container!.querySelector("#item_" + idx) as HTMLElement;
    if (show) {
      if (dom) {
        dom.style.width = width + "px";
        dom.style.height = height + "px";
        dom.style.left = left + "px";
        dom.style.top = top + "px";
        const main = dom.querySelector(".hm_waterfall-item-main") as HTMLElement;
        const footer = dom.querySelector(".hm_waterfall-item-footer") as HTMLElement;
        footer.style.width = width + "px";
        main.style.height = imageHeight + "px";
        if (url) {
          main.style.backgroundImage = "url(" + url + ")";
        }
      } else {
        const newDom = document.createElement("div");
        const main = document.createElement("div");
        const footer = document.createElement("div");
        main.classList.add("hm_waterfall-item-main");
        footer.classList.add("hm_waterfall-item-footer");
        footer.id = "footer_" + idx;
        footer.style.width = width + "px";
        newDom.classList.add("hm_waterfall-item");
        main.style.height = imageHeight + "px";
        if (url) {
          main.style.backgroundImage = "url(" + url + ")";
        }
        main.style.backgroundSize = "100% 100%";
        this.footer && footer.appendChild(this.footer(item));
        newDom.addEventListener("click", () => {
          this.cardClick(item);
        });
        newDom.id = "item_" + idx;
        newDom.style.width = width + "px";
        newDom.style.height = height + "px";
        newDom.style.left = left + "px";
        newDom.style.top = top + "px";
        newDom.appendChild(main);
        newDom.appendChild(footer);
        this.container!.appendChild(newDom);
      }
    } else {
      dom?.remove();
    }
  }
  // 计算每一列宽度
  private computeColumnWidth() {
    const columnNum = this.columnNum;
    const allGapLength = (columnNum - 1) * this.gap;
    this.columnWidth = (this.container!.offsetWidth - allGapLength) / columnNum;
  }
  private initPositionList() {
    this.positionList = [];
    for (let i = 0; i < this.columnNum; i++) {
      this.positionList.push({
        columnIdx: i + 1, //第几列
        columnHeight: 0, //对应高
      });
    }
  }
  private getColumnNum(boxWidth: number): number {
    if (boxWidth > 1600) {
      return 5;
    } else if (boxWidth > 1200) {
      return 4;
    } else if (boxWidth >= 768) {
      return 3;
    } else {
      return 2;
    }
  }
  private computeDomData(list: ICardItem[], startRenderIdx = 0) {
    const length = list.length;
    for (let i = 0; i < length; i++) {
      const item = list[i];
      const idx = i + startRenderIdx;
      const imageHeight = (item.height * this.columnWidth) / item.width;
      const param = {
        ...item,
        idx,
        columnIdx: 0,
        width: this.columnWidth,
        height: imageHeight,
        left: 0,
        top: 0,
        imageHeight,
        show: true,
        url: item.url || "",
        style: {
          width: this.columnWidth + "px",
          height: imageHeight + "px",
        },
      };
      this.domDataList.push(param);
      this.renderDom(param);
    }
    nextTick(() => {
      this.setCardPos(startRenderIdx);
    });
  }
  private setCardPos(startIdx: number) {
    const length = this.domDataList.length;
    const end = startIdx === 0 ? length : startIdx + this.pageSize;
    const endIdx = end <= length ? end : length;
    for (let i = startIdx; i < endIdx; i++) {
      const domItem = this.domDataList[i];
      const { idx, imageHeight, width } = domItem;
      const param: IRenderItem = {
        ...domItem,
      };
      const footerHeight = (document.querySelector("#footer_" + idx) as HTMLElement).offsetHeight;
      const height = imageHeight + footerHeight;
      this.positionList.sort((a, b) => a.columnHeight - b.columnHeight);
      const minColumn = this.positionList[0];
      const { columnIdx, columnHeight } = minColumn;
      const top = columnHeight;
      const left = (columnIdx - 1) * (this.columnWidth + this.gap);
      param.columnIdx = columnIdx;
      param.top = top;
      param.left = left;
      param.height = height;
      param.style = {
        width: width + "px",
        height: height + "px",
        transform: `translate(${left}px,${top}px)`,
      };
      param.show = this.checkIsRender(param);
      this.positionList[0].columnHeight += height + this.gap;
      this.domDataList[i] = { ...domItem, ...param };
      this.renderDom(param);
    }
    this.setContainerHeight();
  }
  private updatePos() {
    this.domDataList.forEach((item, index) => {
      this.domDataList[index].show = this.checkIsRender(item);
      this.renderDom(item);
    });
  }
  public addLoading(cb: () => HTMLDivElement) {
    this.addSlot(this.loadingContainer!, cb());
  }
  public setColumnNum(num: number) {
    this.columnNum = num;
    this.resizeFn();
  }
  private addSlot(container: HTMLDivElement, slotContent: HTMLDivElement | string | null) {
    container.innerHTML = "";
    if (typeof slotContent === "string") {
      container.innerHTML = slotContent as string;
    } else {
      container.appendChild(slotContent as HTMLDivElement);
    }
  }
  private cardClick(item: IRenderItem) {
    this.onCardClick && this.onCardClick(item);
  }
  private setContainerHeight() {
    this.positionList.sort((a, b) => a.columnHeight - b.columnHeight);
    this.container!.style.height =
      this.positionList[this.positionList.length - 1].columnHeight + this.loadingContainer!.offsetHeight + 32 + "px";
  }
  private checkIsRender(params: ICardItem) {
    const { top, height } = params;
    const y = top + height;
    const topLine = this.waterfallContainer!.scrollTop - this.screenOffset;
    const bottomLine = this.waterfallContainer!.scrollTop + this.waterfallContainer!.offsetHeight + this.screenOffset;
    const overTopLine = y < topLine;
    const underBottomLine = top > bottomLine;
    return !overTopLine && !underBottomLine;
  }
  private async getList() {
    try {
      const nextList = await this.request(this.page, this.pageSize);
      this.hasNextPage = !!nextList.length && nextList.length === this.pageSize;
      this.list = this.page === 1 ? nextList : this.list.concat(nextList);
      return nextList;
    } catch (error) {
      throw new Error("request error");
    }
  }
  private addStyle() {
    const style = document.createElement("style");
    style.innerHTML = `
    .hm_waterfall-back-top {
    }

    .hm_waterfall-loading {
      height: 32px;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.15s;
    }

    .hm_waterfall-container::-webkit-scrollbar {
      width: 8px;
      background-color: #eee;
    }
    .hm_waterfall-container::-webkit-scrollbar-thumb {
      background-color: #bbb;
      border-radius: 4px;
    }

    .hm_waterfall-container::-webkit-scrollbar-thumb:hover {
      background-color: #aaa;
    }

    .hm_waterfall-container {
      box-sizing: border-box;
      padding: 20px;
      height: 100%;
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .hm_container {
      position: relative;
      width: 100%;
    }

    .hm_waterfall-item {
      position: absolute;
      transition: all 0.12s;
      font-family: sans-serif;
      display: flex;
      flex-direction: column;
      background-color: #fff;
      border-radius: 10px;
      overflow: hidden;
    }
    .hm_waterfall-item-main {
      flex-grow: 1;
      flex-shrink: 0;
    }

    `;
    return style;
  }
}
