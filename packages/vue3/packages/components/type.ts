import type { CSSProperties } from "vue";

export interface IWaterfallProps {
  gap?: number;
  pageSize?: number;
  //是否显示加载图标
  showLoading?: boolean;
  columnNum: number;
  request: (page: number, pageSize: number) => Promise<any>;
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
  style: CSSProperties;
  [key: string]: any;
}
export interface IPosItem {
  columnIdx: number;
  columnHeight: number;
}
