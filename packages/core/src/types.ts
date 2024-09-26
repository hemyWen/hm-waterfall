export interface IWaterfallProps {
  gap?: number;
  pageSize?: number;
  columnNum: number;
  //是否显示加载图标
  showLoading?: boolean;
  request: (page: number, pageSize: number) => Promise<any>;
  footer?: (item: IRenderItem) => HTMLDivElement;
  onCardClick?: (item: IRenderItem) => void;
  backTopSlot?: () => HTMLDivElement;
  loadingSlot?: () => HTMLDivElement;
}
export interface ICardItem {
  width: number;
  height: number;
  url?: string;
  [key: string]: any;
}
export interface IRenderItem {
  idx: number;
  columnIdx: number;
  imageHeight: number;
  height: number;
  width: number;
  top: number;
  left: number;
  show: boolean;
  url: string;
  style: Partial<CSSStyleDeclaration>;
  [key: string]: any;
}
export interface IPosItem {
  columnIdx: number;
  columnHeight: number;
}
