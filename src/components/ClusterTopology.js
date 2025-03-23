// combo Box 그래프
import React, { useEffect, useRef } from "react";
import G6 from "@antv/g6"; // AntV G6 v4.8.0 (default import)

const ClusterTopology = () => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);

  useEffect(() => {
    // 1) DOM 컨테이너가 준비되지 않았다면 return
    if (!containerRef.current) return;

    // 2) 그래프가 이미 존재하면 제거
    if (graphRef.current) {
      graphRef.current.destroy();
      graphRef.current = null;
    }

    // 3) 예시 데이터 (멀티클러스터 - 네임스페이스 - 파드 구조)
    const data = {
      // 파드 노드 목록
      nodes: [
        // 네임스페이스 ns-a에 속하는 파드
        { id: "pod-1", label: "Istio", comboId: "ns-a", type: "star" },
        { id: "pod-2", label: "Pod 2", comboId: "ns-a" },
        { id: "pod-a", label: "Pod a", comboId: "ns-a" },
        { id: "pod-b", label: "Pod b", comboId: "ns-a" },
        // 네임스페이스 ns-b에 속하는 파드
        { id: "pod-3", label: "Pod 3", comboId: "ns-b" },
        { id: "pod-4", label: "Pod 4", comboId: "ns-b" },
        // 네임스페이스 ns-x에 속하는 파드
        { id: "pod-5", label: "Pod 5", comboId: "ns-x" },
        // 네임스페이스 ns-y에 속하는 파드
        { id: "pod-6", label: "Sentryflow-api", comboId: "ns-y" },
        { id: "pod-7", label: "Sentryflow-api", comboId: "ns-z" },
        { id: "pod-8", label: "Sentryflow-api", comboId: "ns-z" },
      ],
      // 콤보 구조: Cluster -> Namespace
      combos: [
        // 최상위 콤보 (클러스터)
        { id: "cluster-1", label: "Cluster 1" },
        { id: "cluster-2", label: "Cluster 2" },
        { id: "cluster-3", label: "Cluster 3" },

        // 서브 콤보 (네임스페이스) - parentId로 상위 클러스터 지정
        { id: "ns-a", label: "Namespace A", parentId: "cluster-1" },
        { id: "ns-b", label: "Namespace B", parentId: "cluster-1" },
        { id: "ns-x", label: "Namespace X", parentId: "cluster-2" },
        { id: "ns-y", label: "Namespace Y", parentId: "cluster-2" },
        { id: "ns-z", label: "Namespace Z", parentId: "cluster-3" },
      ],
      // 파드 간 연결 에지
      edges: [
        // { source: "pod-1", target: "pod-2" },
        // { source: "pod-3", target: "pod-4" },
        // { source: "pod-2", target: "pod-3" },
        // { source: "pod-5", target: "pod-6" },
        // { source: "pod-1", target: "pod-6" },
        // { source: "pod-7", target: "pod-a" },
        { source: "pod-1", target: "pod-2" },
        { source: "pod-1", target: "pod-3" },
        { source: "pod-1", target: "pod-4" },
        { source: "pod-1", target: "pod-5" },
        { source: "pod-1", target: "pod-a" },
        { source: "pod-1", target: "pod-b" },
        { source: "pod-3", target: "pod-7" },
        { source: "pod-3", target: "pod-8" },
      ],
    };

    // 4) 그래프(Topology) 생성
    const width = containerRef.current.scrollWidth;
    const height = containerRef.current.scrollHeight || 600;

    const graph = new G6.Graph({
      container: containerRef.current,
      width,
      height,
      // 콤보를 시각적으로 묶어서 배치해주는 comboForce 레이아웃
      layout: {
        type: "comboForce",
        // 옵션들 (필요에 따라 값 조정)
        nodeSpacing: 40, // 파드들 사이의 최소 간격
        preventOverlap: true,
        preventComboOverlap: true,
        // linkDistance: 150, // 간선 길이
        // comboSpacing: 200,
        // comboPadding: 800,
        // alpha: 0.9,
        // alphaDecay: 0.02,
        // alphaMin: 0.01,
      },
      // 노드(파드) 기본 설정
      defaultNode: {
        type: "circle",
        size: 30,
        style: {
          lineWidth: 1,
          stroke: "#666",
        },
        labelCfg: {
          position: "bottom",
          offset: 5,
        },
      },
      // 에지(연결선) 기본 설정
      defaultEdge: {
        style: {
          stroke: "#999",
          lineAppendWidth: 3,
          endArrow: {
            path: G6.Arrow.triangle(10,12,0),
            fill: '#999'
          }
        },
      },
      // 콤보(그룹) 기본 설정
      defaultCombo: {
        type: "rect", // 사각형 콤보
        style: {
          lineWidth: 2,
          lineDash: [4, 4],
          stroke: "#aaa",
          fill: "rgba(200, 200, 200, 0.1)",
        },
        padding: [40, 40, 20, 40], // 파드 사이의 패딩
        labelCfg: {
          position: "top",
          refY: 10,
        },
      },
      // 인터랙션 모드
      modes: {
        default: [
          "drag-canvas",
          "zoom-canvas",
          "drag-combo", // 콤보 드래그
        ],
      },
    });

    // 5) 데이터 바인딩 & 렌더
    graph.data(data);
    graph.render();

    // 6) 리사이즈 이벤트 핸들러
    const handleResize = () => {
      if (!graph || graph.get("destroyed")) return;
      const newWidth = containerRef.current.scrollWidth;
      const newHeight = containerRef.current.scrollHeight || 600;
      graph.changeSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // 그래프 인스턴스 저장
    graphRef.current = graph;

    // cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (graph && !graph.get("destroyed")) {
        graph.destroy();
      }
      graphRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "600px",
        border: "1px solid #ccc",
        marginTop: "20px",
      }}
    />
  );
};

export default ClusterTopology;
