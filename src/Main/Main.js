import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Log from "../components/Log"; // 테이블 컴포넌트 추가
import "./Main.css";
import Topology2 from "../components/Topology2"
import axios from 'axios';
import ClusterTopology from "../components/ClusterTopology";
import ClusterTopology2 from "../components/ClusterTopology2";
import Header from "../components/Header";
import GraphBottom from "../components/GraphBottom";
import { Send } from "react-bootstrap-icons";

const Main = () => {
  const [tableHeight, setTableHeight] = useState(35); // 초기값 30vh
  const isResizing = useRef(false);
  // Cluster, Namespace Checkbox Rendering
  const [checkedBoxItems, SetCheckedBoxItems] = useState({
    cluster: false,
    namespace: false,
  })
  const [selectedNamespaces, setSelectedNamespaces] = useState([]); // 상단바에서 선택한 네임스페이스 관리

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    SetCheckedBoxItems((prev) => ({
      ...prev,
      [value]: checked,
    }));
  };

  const handleSelectNamespaceChange = (selectedOptions) => {
    setSelectedNamespaces(selectedOptions || []);
  };


  // 클러스터 정보 불러오는 블록
  const [clusterNamespaces, setClusterNamespaces] = useState({});
  const [logEntries , setLogEntries] = useState({});
  const [topologyData, setTopologyData] = useState({ nodes: [], edges: [] });


  const getNodeStyle = (type) => {
    switch (type) {
      case "Service":
        return {type: "star"};
      case "Unknown":
        return {type: "diamond"};
      default:
        return {type: "circle"};
    }
  }

  useEffect(() => {
    axios.get("/clusters")
      .then((response) => {
        const formattedData = response.data.reduce((acc, cluster) => {
          acc[cluster.name] = cluster.namespaces.map(ns => ns.name);
          return acc;
        }, {});
        setClusterNamespaces(formattedData);
      })
      .catch((error) => {
        console.error("Error fetching clusters:", error);
      });

    axios.get("/api/logs")
      .then((response) => {
        setLogEntries(response.data);
        const combo = [];
        const ns_seen = new Set();
        response.data.forEach((item) => {
          const {srcNamespace, dstNamespace} = item;
          if(!ns_seen.has(srcNamespace)){
            ns_seen.add(srcNamespace);
            combo.push({
              id: srcNamespace,
              label: srcNamespace,
            })
          }
          if(!ns_seen.has(dstNamespace)){
            ns_seen.add(dstNamespace);
            combo.push({
              id: dstNamespace,
              label: dstNamespace,
            })
          }
        })
        // Pod 데이터 추출 - kind 추가해야 함
        const seen = new Set();
        const node = [];
        const edge = [];
        response.data.forEach((item)=> {
          const { dstIP, dstName, dstNamespace, srcIP, srcName, srcNamespace, srcType, dstType, srcPort, dstPort, method, path, responseCode, timeStamp} = item;
          if(!seen.has(srcIP)){
            seen.add(srcIP);
            const style = getNodeStyle(srcType);
            node.push({
              id: srcName,
              label: srcName,
              ip: srcIP,
              name: srcName,
              kind: srcType,
              namespace: srcNamespace,
              ...style
            });
          }
          if(!seen.has(dstIP)){
            seen.add(dstIP);
            const style = getNodeStyle(dstType);
            node.push({
              id: dstName,
              label: dstName,
              ip: dstIP,
              name: dstName,
              kind: dstType,
              namespace: dstNamespace,
              ...style
            });
          }
          edge.push({
            source: srcName,
            target: dstName,
            srcName: srcName,
            dstName: dstName,
            srcNamespace: srcNamespace,
            dstNamespace: dstNamespace,
            srcKind: srcType,
            dstKind: dstType,
            srcIP: srcIP,
            dstIP: dstIP,
            srcPort: srcPort,
            dstPort: dstPort,
            method: method,
            path: path,
            responseCode: responseCode,
            timeStamp: timeStamp,
          })
        })
        const graphData = {
          nodes: node,
          edges: edge,
          combos: combo
        }
        setTopologyData(graphData)
        console.log("graphData: ", graphData);
      })
      .catch((error) => {
        console.error("Error fetching clusters:", error);
      });
  }, [checkedBoxItems]);

  // 드래그 시작
  const startResizing = (e) => {
    isResizing.current = true;
    document.body.style.userSelect = "none"; // 드래그 시 텍스트 선택 방지
    document.addEventListener("mousemove", resizeTable);
    document.addEventListener("mouseup", stopResizing);
  };

  // 드래그 중 (테이블 크기 조절)
  const resizeTable = (e) => {
    if (!isResizing.current) return;

    const newHeight = ((window.innerHeight - e.clientY) / window.innerHeight) * 100;

    if (newHeight >= 10 && newHeight <= 50) {
      setTableHeight(newHeight);
    }
  };

  // 드래그 종료
  const stopResizing = () => {
    isResizing.current = false;
    document.body.style.userSelect = "auto"; // 다시 텍스트 선택 가능하게 변경
    document.removeEventListener("mousemove", resizeTable);
    document.removeEventListener("mouseup", stopResizing);
  };

  const [logData, setLogData] = useState(null);

  // Log에서 받은 데이터를 저장
  const handleLogData = (data) => {
    setLogData(data);
  };


  // logData 변경 시 다시 렌더링?
  // useEffect(() => {
  //   console.log(logData);
  // }, [logData]);

  
  const renderTopologyComponent = () => {
    const {cluster, namespace} = checkedBoxItems;

    if (cluster && namespace) return <ClusterTopology />;
    if (cluster && !namespace) {
      const { combos, ...graphDataWithoutCombos } = topologyData;
      return <ClusterTopology2 data={graphDataWithoutCombos} />;
    }
    if (!cluster && namespace) {
      const { combos, ...graphDataWithoutCombos } = topologyData;
      return <ClusterTopology2 data={graphDataWithoutCombos} />;
    }
    if (!cluster && !namespace) {
      const { combos, ...graphDataWithoutCombos } = topologyData;
      return <ClusterTopology2 data={graphDataWithoutCombos} />;
    }
  }


  return (
    <div className="main-container">
      {/* ✅ 왼쪽 Sidebar */}
      <Sidebar isOpen={true} />

      {/* ✅ 오른쪽 영역 (메인 컨텐츠 + 테이블 포함) */}
      <div className="main-content">
        {/* ✅ 메인 컨텐츠 (Topology 포함) */}
        <div>
        <Header selectedNamespaces={selectedNamespaces} onSelectNamespaceChange={handleSelectNamespaceChange} />
        </div>
        <div className="content" style={{ height: `${100 - tableHeight}vh`, position: "relative" }}>
        {/* <Topology2 data={topologyData} width={1000} height={600} selectedNamespace={selectedNamespace} selectedLog={logData}/> */}
        {renderTopologyComponent()}
        </div>
        <div>
          <GraphBottom checkedBoxItems={checkedBoxItems} onCheckboxChange={handleCheckboxChange}/>
        </div>

        {/* ✅ 리사이즈 핸들 */}
        {/* <div className="resize-handle" onMouseDown={startResizing}></div> */}

        {/* ✅ 아래쪽 테이블 (높이 조절 가능) */}
        <div className="table-container" style={{ height: `${tableHeight}vh` }}>
          <Log logEntries={logEntries} onLogHover={handleLogData}/>
        </div>
      </div>
    </div>
  );
};

export default Main;
