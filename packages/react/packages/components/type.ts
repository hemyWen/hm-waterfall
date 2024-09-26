import type { CSSProperties, ReactElement } from "react";

export interface IWaterfallProps {
  children?: (key: IRenderItem) => ReactElement;
  loadingSlot?: ReactElement;
  backTopSlot?: ReactElement;
  gap?: number;
  pageSize?: number;
  showLoading?: boolean;
  columnNum: number;
  request: (page: number, pageSize: number) => Promise<any>;
  onCardClick?: (item: IRenderItem) => void;
  requestError?: (error: any) => void;
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
