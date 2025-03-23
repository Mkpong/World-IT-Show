import React, { useEffect, useRef, useState } from "react";
import G6 from "@antv/g6";
import Popup from "./Popup";
import EdgePopup from "./EdgePopup";

const ClusterTopology2 = ({data}) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0, node: null });
  const [edgePopup, setEdgePopup] = useState({ visible: false, x: 0, y: 0, edge: null });

  useEffect(() => {
    if (!containerRef.current) return;

    if (graphRef.current) {
      graphRef.current.destroy();
      graphRef.current = null;
    }

    const width = containerRef.current.scrollWidth;
    const height = containerRef.current.scrollHeight || 600;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      layout: {
        type: "force",
        preventOverlap: true,
        nodeSpacing: 60,
      },
      defaultNode: {
        type: "circle",
        size: 30,
        style: {
          lineWidth: 1,
          stroke: "#666",
          fill: "#eef4ff",
        },
        labelCfg: {
          position: "bottom",
          offset: 5,
          style: {
            fill: "#222",
          },
        },
      },
      defaultEdge: {
        style: {
          stroke: "#999",
          lineAppendWidth: 3,
          endArrow: {
            path: G6.Arrow.triangle(4, 8, 0),
            fill: "#999",
          },
        },
      },
      nodeStateStyles: {
        selected: {
          stroke: "#ff4d4f",
          lineWidth: 3,
          shadowColor: "rgba(255,77,79,0.6)",
          shadowBlur: 10,
        },
      },
      edgeStateStyles: {
        selected: {
          stroke: "#ff4d4f",
          lineWidth: 3,
        },
      },
      modes: {
        default: ["drag-canvas", "zoom-canvas", "drag-node"],
      },
    });

    graph.data(data);
    graph.render();

    // 공통 함수: 모든 선택 효과 제거
    const clearSelection = () => {
      graph.getNodes().forEach((node) => {
        graph.setItemState(node, "selected", false);
      });
      graph.getEdges().forEach((edge) => {
        graph.setItemState(edge, "selected", false);
      });
    };

    // ✅ 노드 클릭
    graph.on("node:click", (evt) => {
      const { item, canvasX, canvasY } = evt;
      const model = item.getModel();

      clearSelection();
      graph.setItemState(item, "selected", true);

      setPopup({
        visible: true,
        x: canvasX + 10,
        y: canvasY + 10,
        node: model,
      });

      setEdgePopup({ visible: false, x: 0, y: 0, edge: null });
    });

    // ✅ 엣지 클릭
    graph.on("edge:click", (evt) => {
      const { item, canvasX, canvasY } = evt;
      const model = item.getModel();

      clearSelection();
      graph.setItemState(item, "selected", true);

      setEdgePopup({
        visible: true,
        x: canvasX + 10,
        y: canvasY + 10,
        edge: model,
      });

      setPopup({ visible: false, x: 0, y: 0, node: null });
    });

    // ✅ 캔버스 클릭 시 초기화
    graph.on("canvas:click", () => {
      clearSelection();
      setPopup({ visible: false, x: 0, y: 0, node: null });
      setEdgePopup({ visible: false, x: 0, y: 0, edge: null });
    });

    const handleResize = () => {
      if (!graph || graph.get("destroyed")) return;
      const newWidth = containerRef.current.scrollWidth;
      const newHeight = containerRef.current.scrollHeight || 600;
      graph.changeSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);
    graphRef.current = graph;

    return () => {
      window.removeEventListener("resize", handleResize);
      if (graph && !graph.get("destroyed")) {
        graph.destroy();
      }
      graphRef.current = null;
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        border: "1px solid #ccc",
      }}
    >
      {popup.visible && (
        <Popup
          x={popup.x}
          y={popup.y}
          node={popup.node}
          onClose={() => setPopup({ visible: false, x: 0, y: 0, node: null })}
        />
      )}
      {edgePopup.visible && (
        <EdgePopup
          x={edgePopup.x}
          y={edgePopup.y}
          edge={edgePopup.edge}
          onClose={() => setEdgePopup({ visible: false, x: 0, y: 0, edge: null })}
        />
      )}
    </div>
  );
};

export default ClusterTopology2;
