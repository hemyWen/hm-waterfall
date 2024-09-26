import "./waterfall.css";
import type { ICardItem, IPosItem, IRenderItem, IWaterfallProps } from "./type";
import { throttle, debounce } from "./tools";
import { useEffect, useRef, useState } from "react";
export default function Waterfall({
  gap = 16,
  pageSize = 50,
  showLoading = true,
  columnNum,
  request,
  children,
  loadingSlot,
  backTopSlot,
  onCardClick,
  requestError,
}: IWaterfallProps) {
  const waterfallContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const columnWidth = useRef(0);
  const page = useRef(1);
  const screenOffset = useRef(0);
  const dataList = useRef<ICardItem[]>([]);

  const positionList = useRef<IPosItem[]>([]);
  const domDataList = useRef<IRenderItem[]>([]);
  const isLoadNextPage = useRef(false);
  const isShowToTop = useRef(false);
  const hasNextPage = useRef(true);
  const lastOffsetWidth = useRef(0);
  const [renderList, setRenderList] = useState<IRenderItem[]>([]);
  const timer = useRef<number | NodeJS.Timeout>(0);
  //初始化数据
  useEffect(() => {
    init();
  }, []);

  //监听滚动
  useEffect(() => {
    const waterfallContainerEle = waterfallContainerRef.current;
    waterfallContainerEle?.addEventListener("scroll", () => {
      handleScroll();
    });
    return () => {
      waterfallContainerEle?.removeEventListener("scroll", handleScroll);
    };
  }, []);
  //监听容器尺寸变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (waterfallContainerRef.current) {
      resizeObserver.observe(waterfallContainerRef.current);
    }
    return () => {
      if (waterfallContainerRef.current) {
        resizeObserver.unobserve(waterfallContainerRef.current);
      }
    };
  }, [columnNum]);
  const init = async () => {
    screenOffset.current = waterfallContainerRef.current!.offsetHeight / 2;
    lastOffsetWidth.current = waterfallContainerRef.current!.offsetWidth;
    computeColumnWidth();
    initPositionList();
    computeDomData(await getList(), 0);
  };

  const handleScroll = throttle(async () => {
    const scrollTop = waterfallContainerRef.current!.scrollTop;
    isShowToTop.current = scrollTop >= window.innerHeight;

    updatePos();
    if (isLoadNextPage.current || !hasNextPage.current) {
      return false;
    }
    if (
      waterfallContainerRef.current!.scrollTop + waterfallContainerRef.current!.offsetHeight >=
      waterfallContainerRef.current!.scrollHeight * 0.85
    ) {
      isLoadNextPage.current = true;
      page.current++;
      const nextList = await getList();
      isLoadNextPage.current = false;
      const startIdx = (page.current - 1) * pageSize;
      computeDomData(nextList, startIdx);
    }
  });
  //容器尺寸变化
  const handleResize = debounce(function () {
    resizeFn();
  }, 150);
  const resizeFn = () => {
    computeColumnWidth();
    lastOffsetWidth.current = waterfallContainerRef.current!.offsetWidth;
    initPositionList();
    computeDomData(dataList.current, 0, true);
  };
  const initPositionList = () => {
    positionList.current = [];
    for (let i = 0; i < columnNum; i++) {
      positionList.current.push({
        columnIdx: i + 1, //第几列
        columnHeight: 0, //对应高
      });
    }
  };
  //计算每一列宽度
  const computeColumnWidth = () => {
    const allGapLength = (columnNum - 1) * gap;
    columnWidth.current = (containerRef.current!.offsetWidth - allGapLength) / columnNum;
  };
  const computeDomData = (list: ICardItem[], startIdx: number = 0, isReSize = false) => {
    const length = list.length;
    for (let i = 0; i < length; i++) {
      const item = list[i];
      const idx = i + startIdx;
      const imageHeight = (item.height * columnWidth.current) / item.width;
      const param = {
        ...item,
        idx,
        columnIdx: 0,
        imageHeight,
        height: imageHeight,
        width: columnWidth.current,
        top: 0,
        left: 0,
        show: true,
        url: item.url || "",
        style: {
          width: columnWidth.current + "px",
          height: (item.height * columnWidth.current) / item.width + "px",
        },
      };
      if (isReSize) {
        domDataList.current[i] = param;
      } else {
        domDataList.current.push(param);
      }
    }
    setRenderList(domDataList.current.filter((item) => item.show));
    timer.current = setTimeout(() => {
      setCardPos(startIdx);
      clearTimeout(timer.current);
    }, 0);
  };
  const setCardPos = (startIdx: number) => {
    const length = domDataList.current.length;
    const end = startIdx === 0 ? length : startIdx + pageSize;
    const endIdx = end <= length ? end : length;
    for (let i = startIdx; i < endIdx; i++) {
      const domItem = domDataList.current[i];
      const { imageHeight, width, idx } = domItem;
      const param: ICardItem = {
        ...domItem,
      };
      const footer_height = slotRefs.current[idx].offsetHeight; //获取底部高度
      const height = imageHeight + footer_height;
      positionList.current.sort((a, b) => a.columnHeight - b.columnHeight);
      const minColumn = positionList.current[0];
      const { columnIdx, columnHeight } = minColumn;
      const top = columnHeight;
      const left = (columnIdx - 1) * (columnWidth.current + gap);
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
      positionList.current[0].columnHeight += height + gap;
      domDataList.current[i] = { ...domItem, ...param };
    }
    setRenderList(domDataList.current.filter((item) => item.show));
    setContainerHeight();
  };
  const updatePos = () => {
    domDataList.current.forEach((item, index) => {
      domDataList.current[index].show = checkIsRender(item);
    });
    setRenderList(domDataList.current.filter((item) => item.show));
  };
  const setContainerHeight = () => {
    const loadingHeight = showLoading ? 32 : 0;
    positionList.current.sort((a, b) => a.columnHeight - b.columnHeight);
    containerRef.current!.style.height =
      positionList.current[positionList.current.length - 1].columnHeight + loadingHeight + "px";
  };
  const checkIsRender = (params: ICardItem) => {
    const { top, height } = params;
    const y = top + height;
    const topLine = waterfallContainerRef.current!.scrollTop - screenOffset.current;
    const bottomLine =
      waterfallContainerRef.current!.scrollTop + waterfallContainerRef.current!.offsetHeight + screenOffset.current;
    const overTopLine = y < topLine;
    const underBottomLine = top > bottomLine;
    return !overTopLine && !underBottomLine;
  };
  const getList = async () => {
    try {
      const nextList = await request(page.current, pageSize);
      hasNextPage.current = !!nextList.length && nextList.length === pageSize;
      dataList.current = page.current === 1 ? nextList : dataList.current.concat(nextList);
      return nextList;
    } catch (error) {
      requestError && requestError(error);
    }
  };
  const scrollToTop = () => {
    waterfallContainerRef.current!.scrollTo({
      left: 0,
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <div ref={waterfallContainerRef} className="hm_waterfall-container">
      <div ref={containerRef} className="hm_container">
        {renderList.map((item) => {
          return (
            <div
              className="hm_waterfall-item"
              key={item.idx}
              style={item.style}
              onClick={() => onCardClick && onCardClick(item)}
            >
              <div
                className="hm_waterfall-item-main"
                style={{
                  height: item.imageHeight,
                  backgroundImage: "url(" + item.url + ")",
                  backgroundSize: "100% 100%",
                }}
              ></div>
              <div
                className="hm_waterfall-footer"
                ref={(el: HTMLDivElement) => (slotRefs.current[item.idx] = el)}
                style={{ width: item.width + "px" }}
              >
                {children?.(item)}
              </div>
            </div>
          );
        })}
        {showLoading && isLoadNextPage.current ? (
          <div className="hm_waterfall-loading">{loadingSlot ? loadingSlot : " 加载中..."}</div>
        ) : null}
        {isShowToTop.current ? (
          <div className="hm_waterfall-back-top" onClick={scrollToTop}>
            {backTopSlot}
          </div>
        ) : null}
      </div>
    </div>
  );
}
