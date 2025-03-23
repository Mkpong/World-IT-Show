import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Popup from '../components/Popup'; // 팝업 컴포넌트

function Topology2({ data, selectedNamespace, width = 800, height = 600, selectedLog }) {
  const svgRef = useRef(null);
  const zoomRef = useRef(null);

  // Pod 클릭 시 정보
  const [selectedPod, setSelectedPod] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    // 간선 Bold 처리하기
  }, [selectedLog]);


  useEffect(() => {
    if (!data || !data.nodes || !data.links) return;
    const { nodes, links } = data;

    // 기존 SVG 초기화
    d3.select(svgRef.current).selectAll('*').remove();
    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const zoomGroup = svg.append('g').attr('class', 'zoom-group');
    zoomRef.current = zoomGroup;

    // 초기 줌 설정
    const initialScale = 0.8;
    const initialTranslate = [
      (width - width * initialScale) / 2,
      (height - height * initialScale) / 2,
    ];

    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform);
      });

    // 줌 적용
    svg.call(zoom);
    // 초기 위치와 스케일 설정
    svg.call(zoom.transform, d3.zoomIdentity.translate(...initialTranslate).scale(initialScale));

    // 네임스페이스 별 박스 계산
    const allNamespaces = Array.from(new Set(nodes.map((d) => d.namespace)));
    const otherNamespaces = allNamespaces.filter((ns) => ns !== selectedNamespace);
    const grouped = d3.group(nodes, (d) => d.namespace);

    // 중앙 박스
    const MAIN_BOX_WIDTH = 300;
    const MAIN_BOX_HEIGHT = 400;
    const centerBox = {
      namespace: selectedNamespace,
      x: width / 6 - MAIN_BOX_WIDTH / 2,
      y: height / 2 - MAIN_BOX_HEIGHT / 2,
      width: MAIN_BOX_WIDTH,
      height: MAIN_BOX_HEIGHT,
    };
    const boxes = [centerBox];

    // 나머지 박스 크기 설정
    const BOX_WIDTH = 300;
    const BASE_BOX_HEIGHT = 50;
    const PAD_HEIGHT = 50;
    const MIN_BOX_HEIGHT = 50;
    const MAX_BOX_HEIGHT = 500;

    const COLUMN_X = width * 0.55;
    const COLUMN_WIDTH = width * 0.7;
    const BOX_GAP = 20;
    let currentY = 50;

    const getBoxHeight = (namespace) => {
      const podCount = grouped.get(namespace)?.length || 0;
      return Math.min(MAX_BOX_HEIGHT, Math.max(MIN_BOX_HEIGHT, BASE_BOX_HEIGHT + podCount * PAD_HEIGHT));
    };

    // 다른 네임스페이스 박스 생성
    otherNamespaces.forEach((ns) => {
      const boxHeight = getBoxHeight(ns);
      const x = COLUMN_X + (COLUMN_WIDTH - BOX_WIDTH) / 2;
      const y = currentY;

      boxes.push({
        namespace: ns,
        x,
        y,
        width: BOX_WIDTH,
        height: boxHeight,
      });

      currentY += boxHeight + BOX_GAP;
    });

    // 네임스페이스 박스 렌더링
    const boxG = zoomGroup.append('g').attr('class', 'namespace-boxes');
    boxG
      .selectAll('rect')
      .data(boxes)
      .enter()
      .append('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('fill', 'none')
      .attr('stroke', 'black')
      .attr('stroke-dasharray', '4,4');

    const textSelection = boxG
      .selectAll('text')
      .data(boxes)
      .enter()
      .append('text')
      .attr('x', (d) => d.x + 10)
      .attr('y', (d) => d.y + 20)
      .attr('text-anchor', 'start')
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text((d) => d.namespace);

    textSelection.raise()

    // 박스 내부에 파드 배치
    const topPadding = 50;
    const bottomPadding = 30;
    for (const box of boxes) {
      const nsNodes = grouped.get(box.namespace) || [];
      if (!nsNodes.length) continue;

      const usableHeight = box.height - (topPadding + bottomPadding);
      const gap = nsNodes.length > 1 ? usableHeight / (nsNodes.length - 1) : 0;
      const centerX = box.x + box.width / 2;

      nsNodes.forEach((pod, i) => {
        pod.x = centerX;
        pod.y = box.y + topPadding + i * gap;
      });
    }

    // 링크에서 source/target이 문자열이면 node 객체로 변환
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    links.forEach((link) => {
      if (typeof link.source === 'string') {
        link.source = nodeMap.get(link.source);
      }
      if (typeof link.target === 'string') {
        link.target = nodeMap.get(link.target);
      }
    });

    const colorScale = d3.scaleOrdinal().domain(allNamespaces).range(d3.schemeCategory10);

    // ▣▣▣ 사각형 교차점 계산 함수 ▣▣▣
    // '사각형 중심(cx, cy)'에서 '목표점(tx, ty)'방향으로 그은 선이
    // 사각형(폭=2*halfW, 높이=2*halfH)의 경계와 만나는 점을 구함
    function getRectangleEdge(cx, cy, tx, ty, halfW, halfH) {
      if (cx === tx && cy === ty) {
        // 동일 좌표면 교차점 계산 불가 → 그대로 반환
        return { x: cx, y: cy };
      }

      const dx = tx - cx;
      const dy = ty - cy;
      const candidates = [];

      // 1) left / right 경계와 교차 (x = cx ± halfW)
      if (dx !== 0) {
        // left
        const tLeft = (-halfW) / dx; 
        const yLeft = dy * tLeft;
        if (Math.abs(yLeft) <= halfH) {
          candidates.push(tLeft);
        }
        // right
        const tRight = halfW / dx;
        const yRight = dy * tRight;
        if (Math.abs(yRight) <= halfH) {
          candidates.push(tRight);
        }
      }
      // 2) top / bottom 경계와 교차 (y = cy ± halfH)
      if (dy !== 0) {
        // top
        const tTop = (-halfH) / dy;
        const xTop = dx * tTop;
        if (Math.abs(xTop) <= halfW) {
          candidates.push(tTop);
        }
        // bottom
        const tBottom = halfH / dy;
        const xBottom = dx * tBottom;
        if (Math.abs(xBottom) <= halfW) {
          candidates.push(tBottom);
        }
      }

      if (candidates.length === 0) {
        // 교차점이 없는 예외 상황
        return { x: cx, y: cy };
      }

      let minDist = Infinity;
      let best = { x: cx, y: cy };
      for (let t of candidates) {
        const ix = cx + dx * t;
        const iy = cy + dy * t;

        // 방향 검사(소스->교차점이 소스->타겟과 같은 방향인지)
        const dot = dx * (ix - cx) + dy * (iy - cy);
        if (dot < 0) continue; // 반대 방향이면 제외

        const dotEnd = dx * (tx - cx) + dy * (ty - cy);
        if (dot > dotEnd) continue; // 타겟 넘어선 교차점도 제외

        // 거리(제곱) 비교
        const dist2 = (ix - cx) ** 2 + (iy - cy) ** 2;
        if (dist2 < minDist) {
          minDist = dist2;
          best.x = ix;
          best.y = iy;
        }
      }
      return best;
    }

    /* ──────────────────────────────────────────────
        ↓↓↓ 추가: 양방향 선 오프셋용 로직 ↓↓↓
    ────────────────────────────────────────────── */
    /** A->B, B->A 양쪽이 있으면 한쪽에 오프셋을 줄 것이므로,
     *  각 방향을 키로 한 객체 생성 */
    const linkPairs = {};
    links.forEach((lk) => {
    const key = lk.source.id + '->' + lk.target.id;
    linkPairs[key] = true;
    });

    /** '반대 방향' 링크(B->A)가 존재하는지 체크하는 함수 */
    function isReversedLink(d) {
    const reverseKey = d.target.id + '->' + d.source.id;
    return !!linkPairs[reverseKey];
    }

    /** 라인을 수직 방향으로 offsetAmount만큼 평행 이동 */
    function offsetLineCoord(x1, y1, x2, y2, offsetAmount = 10) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    // 수직 방향 벡터(nx, ny)
    const nx = -dy / length;
    const ny = dx / length;

    return {
        x1o: x1 + nx * offsetAmount,
        y1o: y1 + ny * offsetAmount,
        x2o: x2 + nx * offsetAmount,
        y2o: y2 + ny * offsetAmount,
    };
    }

    // SVG <defs>에 화살표 marker 추가
    const defs = zoomGroup.append('defs');
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#000');

    zoomGroup
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)')
    //   .on('click', function (event, d) {
    //     setSelectedLink((prevSelected) => {
    //       const isSameLink = prevSelected && prevSelected === d; // ✅ 기존 선택된 링크와 동일한지 확인
    //       const newSelected = isSameLink ? null : d; // ✅ 같은 걸 다시 누르면 선택 해제, 다르면 선택
      
    //       d3.selectAll('.links line') // ✅ 모든 간선 초기화
    //         .attr('stroke-width', 2); 
      
    //       if (newSelected) {
    //         d3.select(this).attr('stroke-width', 4); // ✅ 선택된 간선 bold
    //       }
      
    //       return newSelected;
    //     });
    //   })
      // ──────────────────────────────────────────────
      // "각 link"에 대해, 사각형 경계 교차점 계산 + 오프셋 처리
      // ──────────────────────────────────────────────
      .each(function (d) {
        // (1) 사각형 경계 교차점 계산 (source)
        if (d.source.width && d.source.height) {
          const { x, y } = getRectangleEdge(
            d.source.x, d.source.y,
            d.target.x, d.target.y,
            d.source.width / 2, d.source.height / 2
          );
          d.x1 = x;
          d.y1 = y;
        } else {
          d.x1 = d.source.x;
          d.y1 = d.source.y;
        }
    
        // (2) 사각형 경계 교차점 계산 (target)
        if (d.target.width && d.target.height) {
          const { x, y } = getRectangleEdge(
            d.target.x, d.target.y,
            d.source.x, d.source.y,
            d.target.width / 2, d.target.height / 2
          );
          d.x2 = x;
          d.y2 = y;
        } else {
          d.x2 = d.target.x;
          d.y2 = d.target.y;
        }
    
        // (3) 양방향이면 한쪽만 오프셋
        if (isReversedLink(d)) {
          const { x1o, y1o, x2o, y2o } = offsetLineCoord(d.x1, d.y1, d.x2, d.y2, 10);
          d.x1o = x1o;
          d.y1o = y1o;
          d.x2o = x2o;
          d.y2o = y2o;
          d.isOffset = true;
        } else {
          d.isOffset = false;
        }
      })
      // ──────────────────────────────────────────────
      // 최종 x1,y1,x2,y2 적용: 오프셋 여부에 따라
      // ──────────────────────────────────────────────
      .attr('x1', (d) => d.isOffset ? d.x1o : d.x1)
      .attr('y1', (d) => d.isOffset ? d.y1o : d.y1)
      .attr('x2', (d) => d.isOffset ? d.x2o : d.x2)
      .attr('y2', (d) => d.isOffset ? d.y2o : d.y2);

    // Pod 노드 렌더링
    const podRectHeight = 35;
    const paddingX = 10;

    const pods = zoomGroup
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'pod-group')
      // hover 시 테두리 강조
      .on('mouseover', function (event, d) {
        d3.select(this).select('rect')
          .attr('stroke', '#87CEFA')
          .attr('stroke-width', 3);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this).select('rect')
          .attr('stroke', '#000')
          .attr('stroke-width', 1);
      })
      // 클릭 시 팝업 열기
      .on('click', (event, d) => {
        setSelectedPod({ label: d.id, group: d.namespace });
        setIsPopupOpen(true);
      });

    // 노드 텍스트
    const podTexts = pods
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .text((d) => d.id)
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y + 5);

    // 각 Pod에 width, height 저장 (사각형 크기)
    pods.each(function (d) {
      const textElement = d3.select(this).select('text');
      const bbox = textElement.node().getBBox();
      d.width = Math.max(60, bbox.width + paddingX * 2); // 최소 폭 60
      d.height = podRectHeight; // 고정 높이 35
    });

    // 노드 사각형
    pods
      .append('rect')
      .attr('x', (d) => d.x - d.width / 2)
      .attr('y', (d) => d.y - podRectHeight / 2)
      .attr('width', (d) => d.width)
      .attr('height', (d) => d.height)
      .attr('rx', 2)
      .attr('ry', 2)
    //   .attr('fill', (d) => colorScale(d.namespace))
      .attr('fill', 'white')
      .attr('stroke', '#000')
      .attr('stroke-width', 1);

    // 텍스트를 사각형 위로 오도록
    podTexts.raise();

  }, [data, selectedNamespace, width, height]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ flex: isPopupOpen ? 0.8 : 1 }}>
        <svg ref={svgRef} />
      </div>

      {isPopupOpen && (
        <div>
          <Popup selectedPod={selectedPod} onClose={() => setIsPopupOpen(false)} />
        </div>
      )}

    </div>
  );
}

export default Topology2;
