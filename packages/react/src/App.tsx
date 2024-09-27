import { useEffect, useRef, useState } from "react";
import { IRenderItem } from "../packages/components/type.ts";
import Watefall from "../packages/components/Waterfall.tsx";
import "./App.css";

function App() {
  const listRef = useRef<HTMLDivElement>(null);
  const [columnNum, setColumnNum] = useState(2);

  //监听容器尺寸变化
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const num = getColumnNum(entries[0].target.clientWidth);
      setColumnNum(num);
    });
    if (listRef.current) {
      resizeObserver.observe(listRef.current);
    }
    return () => {
      if (listRef.current) {
        resizeObserver.unobserve(listRef.current);
      }
    };
  }, []);
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
  const getData = (page: number, pageSize: number) => {
    return new Promise((resolve) => {
      fetch(`http://localhost:3000/posts?_page=${page}&_per_page=${pageSize}`)
        .then((response) => response.json())
        .then((data) => resolve(data.data));
    });
  };
  function cardClick(item: IRenderItem) {
    alert(`点击了========${item.title}`);
  }
  const loadingSlot = <div className="loading">...</div>;
  const backTopSlot = <div className="back-top-btn">↑</div>;
  return (
    <div className="root">
      <div className="list" ref={listRef}>
        <Watefall
          request={getData}
          columnNum={columnNum}
          onCardClick={cardClick}
          loadingSlot={loadingSlot}
          backTopSlot={backTopSlot}
        >
          {(item: any) => (
            <div className="text-info">
              <div className="text">{item.title}</div>
              <div className="info">
                <img src={item.avatar} style={{ width: "20px", height: "20px", borderRadius: "50%" }} />
                <span>{item.author}</span>
              </div>
            </div>
          )}
        </Watefall>
      </div>
    </div>
  );
}

export default App;
