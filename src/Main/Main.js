import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Log from "../components/Log"; // 테이블 컴포넌트 추가
import "./Main.css";
import axios from 'axios';
import ClusterTopology from "../components/ClusterTopology";
import ClusterTopology2 from "../components/ClusterTopology2";
import ClusterTopology3 from "../components/ClusterTopology3";
import Header from "../components/Header";
import GraphBottom from "../components/GraphBottom";
import { Send } from "react-bootstrap-icons";

const Main = () => {
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

    const data2 = {
      // 파드 노드 목록
      nodes: [
        // 네임스페이스 ns-a에 속하는 파드
        { id: "pod-1", label: "Istio", comboId: "cluster-1", type: "star" },
        { id: "pod-2", label: "Pod 2", comboId: "cluster-1" },
        { id: "pod-a", label: "Pod a", comboId: "cluster-1" },
        { id: "pod-b", label: "Pod b", comboId: "cluster-1" },
        // 네임스페이스 ns-b에 속하는 파드
        { id: "pod-3", label: "Pod 3", comboId: "cluster-2" },
        { id: "pod-4", label: "Pod 4", comboId: "cluster-2" },
        // 네임스페이스 ns-x에 속하는 파드
        { id: "pod-5", label: "Pod 5", comboId: "cluster-3" },
        // 네임스페이스 ns-y에 속하는 파드
        { id: "pod-6", label: "Sentryflow-api", comboId: "cluster-3" },
        { id: "pod-7", label: "Sentryflow-api", comboId: "cluster-3" },
        { id: "pod-8", label: "Sentryflow-api", comboId: "cluster-3" },
      ],
      combos: [
        // 최상위 콤보 (클러스터)
        { id: "cluster-1", label: "Cluster 1" },
        { id: "cluster-2", label: "Cluster 2" },
        { id: "cluster-3", label: "Cluster 3" },
      ],
      // 파드 간 연결 에지
      edges: [
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
  
  // 새로고침 버튼 함수
  const handleRefresh = () => {
    setSelectedNamespaces((prev) => [...prev]);
  }


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
      // 1. 클러스터 이름 기준으로 정렬
      const sortedClusters = [...response.data].sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // 2. 각 클러스터의 네임스페이스 정렬
      const formattedData = sortedClusters.reduce((acc, cluster) => {
        const sortedNamespaces = [...cluster.namespaces].sort((a, b) => {
          if (typeof a === 'string') return a.localeCompare(b);
          return a.name.localeCompare(b.name);
        });

        acc[cluster.name] = sortedNamespaces;
        return acc;
      }, {});

      setClusterNamespaces(formattedData);
      console.log("Formatted & Sorted:", formattedData);
    })
    .catch((error) => {
      console.error("Error fetching clusters:", error);
    });

    const request_body = selectedNamespaces.map(({ clusterName, namespace }) => ({
      clustername: clusterName,
      namespace: namespace,
    }));
    console.log("log request body:", request_body)
    if(selectedNamespaces.length === 0){
      setLogEntries({});
      setTopologyData({ nodes: [], edges: [] })
    }
    else{
      axios.post("/api/logs" , request_body)
        .then((response) => {
          setLogEntries(response.data);
          console.log(checkedBoxItems.cluster);
          const combo = [];
          // Only Namespace ComboBox
          if(checkedBoxItems.namespace && !checkedBoxItems.cluster)
          {
            const ns_seen = new Set();
            response.data.forEach((item) => {
              const { srcCluster, dstCluster, srcNamespace, dstNamespace} = item;
              const src_id = srcCluster+"/"+srcNamespace;
              if(!ns_seen.has(src_id)){
                ns_seen.add(src_id);
                combo.push({
                  id: src_id,
                  label: src_id,
                })
              }
              const dst_id = dstCluster+"/"+dstNamespace;
              if(!ns_seen.has(dst_id)){
                ns_seen.add(dst_id);
                combo.push({
                  id: dst_id,
                  label: dst_id, 
                })
              }
            })
          }
          // Only cluster combobox
          if(checkedBoxItems.cluster && !checkedBoxItems.namespace){
            const cluster_seen = new Set();
            response.data.forEach((item) => {
              const {srcCluster, dstCluster , srcNamespace, dstNamespace} = item;
              const src_id = srcCluster+"/"+srcNamespace;
              if(!cluster_seen.has(src_id)){
                cluster_seen.add(src_id);
                combo.push({
                  id: src_id,
                  label: srcCluster+"test",
                  })
              }
              const dst_id = dstCluster+"/"+dstNamespace;
              if(!cluster_seen.has(dst_id)){
                cluster_seen.add(dst_id);
                combo.push({
                  id: dst_id,
                  label: dstCluster+"test",
                })
              }
            })
          }
          // select namespace+cluster combobox
          if(checkedBoxItems.cluster && checkedBoxItems.namespace){
            const ns_seen = new Set();
            const cluster_seen = new Set();
            // cluster combobox 추가
            response.data.forEach((item) => {
              const {srcCluster, dstCluster , srcNamespace, dstNamespace} = item;
              if(!cluster_seen.has(srcCluster)){
                cluster_seen.add(srcCluster);
                if(srcCluster !== "Unknown" && srcCluster !== ""){
                  combo.push({
                    id: srcCluster+"/",
                    label: srcCluster,
                  })
                }
              }
              if(!cluster_seen.has(dstCluster)){
                cluster_seen.add(dstCluster);
                if(dstCluster !== "Unknown" && dstCluster !== ""){
                  combo.push({
                    id: dstCluster+"/",
                    label: dstCluster,
                  })
                }
              }
              // 여기 네임스페이스 콤보박스 추가해야 함
            })
            
          }
          // Pod 데이터 추출 - kind 추가해야 함
          const seen = new Set();
          const node = [];
          const edge = [];
          response.data.forEach((item)=> {
            const { srcCluster, dstCluster, dstIP, dstName, dstNamespace, srcIP, srcName, srcNamespace, srcType, dstType, srcPort, dstPort, method, path, responseCode, timeStamp} = item;
            if(!seen.has(srcIP)){
              seen.add(srcIP);
              const style = getNodeStyle(srcType);
              node.push({
                id: srcName,
                label: srcName,
                ip: srcIP,
                name: srcName,
                kind: srcType,
                cluster: srcCluster,
                namespace: srcNamespace,
                comboId: srcCluster+"/"+srcNamespace,
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
                cluster: dstCluster,
                namespace: dstNamespace,
                comboId: dstCluster+"/"+dstNamespace,
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
      }
  }, [checkedBoxItems , selectedNamespaces]);

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

  
  const renderTopologyComponent = () => {
    const {cluster, namespace} = checkedBoxItems;

    if (!cluster && !namespace) { // Only Pod level
      const { combos, ...graphDataWithoutCombos } = topologyData;
      return <ClusterTopology data={graphDataWithoutCombos} />;
    }
    if (cluster && !namespace) { // Only cluster ComboBox
      return <ClusterTopology3 data={topologyData} />;
    }
    if (!cluster && namespace) { // Only Namespace ComboBox
      return <ClusterTopology3 data={topologyData} />;
    }
    if (cluster && namespace) return <ClusterTopology3 data={data} />; // Custer + Namespace ComboBox
  }


  return (
    <div className="main-container">
      {/* ✅ 왼쪽 Sidebar */}
      <Sidebar isOpen={true} />

      {/* ✅ 오른쪽 영역 (메인 컨텐츠 + 테이블 포함) */}
      <div className="main-content">
        {/* ✅ 메인 컨텐츠 (Topology 포함) */}
        <div>
        <Header
          selectedNamespaces={selectedNamespaces}
          onSelectNamespaceChange={handleSelectNamespaceChange}
          clusterInfo={clusterNamespaces}
          onRefresh={handleRefresh}
        />
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
