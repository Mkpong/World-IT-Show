import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Log from "../components/Log"; // 테이블 컴포넌트 추가
import "./Main.css";
import axios from 'axios';
import ClusterTopology from "../components/ClusterTopology";
import ClusterTopology3 from "../components/ClusterTopology3";
import Header from "../components/Header";
import { Send } from "react-bootstrap-icons";
import { image } from "d3";

const Main = () => {
  const [tableHeight, setTableHeight] = useState(40); // 초기값 30vh
  const isResizing = useRef(false);
  // Cluster, Namespace Checkbox Rendering
  const [checkedBoxItems, SetCheckedBoxItems] = useState({
    cluster: false,
    namespace: false,
  })
  const [selectedNamespaces, setSelectedNamespaces] = useState([]); // 상단바에서 선택한 네임스페이스 관리
  const [timeRange, setTimeRange] = useState("1m")
  const [refreshInterval, setRefreshInterval] = useState(10000);
  const [refreshCount, setRefreshCount] = useState(0);
  
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

  const hanldeTimeRangeChange = (selectedTimeRange) => {
    setTimeRange(selectedTimeRange.value)
  }

  const handleIntervalTimeChange = (selectedInterval) => {
    setRefreshInterval(selectedInterval);
    console.log(selectedInterval);
  }

  // 클러스터 정보 불러오는 블록
  const [clusterNamespaces, setClusterNamespaces] = useState({});
  const [logEntries , setLogEntries] = useState({});
  const [topologyData, setTopologyData] = useState({ nodes: [], edges: [] });


  const getNodeStyle = (type) => {
    switch (type) {
      case "Service":
        return {img: "/Service-Logo.png"};
      // case "Unknown":
      //   return {img: "/Service"};
      default:
        return {img: "/Pod-Logo.png"};
    }
  }


  useEffect(() => {
    console.log("create useEffect()")
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
      // console.log("Formatted & Sorted:", formattedData);
    })
    .catch((error) => {
      console.error("Error fetching clusters:", error);
    });

    const request_body = {
      timerange: timeRange, // 예: "5m" 또는 "30m"
      namespaces: selectedNamespaces.map(({ clusterName, namespace }) => ({
        cluster: clusterName,
        namespace: namespace,
      })),
    };

    // const request_body = selectedNamespaces.map(({ clusterName, namespace }) => ({
    //   clustername: clusterName,
    //   namespace: namespace,
    // }));
    
    // console.log("log request body:", request_body)
    if(selectedNamespaces.length === 0){
      setLogEntries({});
      setTopologyData({ nodes: [], edges: [] })
    }
    else{
      axios.post("/api/logs" , request_body)
        .then((response) => {
          setLogEntries(response.data);
          if(response.data === null){
            setLogEntries({});
            setTopologyData({ nodes: [], edges: [] })
          }
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
              const src_id  = srcCluster+"-c";
              if(!cluster_seen.has(src_id)){
                cluster_seen.add(src_id);
                combo.push({
                  id: src_id,
                  label: srcCluster,
                  })
              }
              const dst_id = dstCluster+"-c";
              if(!cluster_seen.has(dst_id)){
                cluster_seen.add(dst_id);
                combo.push({
                  id: dst_id,
                  label: dstCluster,
                })
              }
            })
          }
          // select namespace+cluster combobox
          if(checkedBoxItems.cluster && checkedBoxItems.namespace){
            const ns_seen = new Set();
            const cluster_seen = new Set();
            response.data.forEach((item) => {
              const {srcCluster, dstCluster , srcNamespace, dstNamespace} = item;
              // source, destination Cluster 추가
              if(!cluster_seen.has(srcCluster)){
                cluster_seen.add(srcCluster);
                combo.push({
                  id: srcCluster+"-c",
                  label: srcCluster,
                })
              }
              if(!cluster_seen.has(dstCluster)){
                cluster_seen.add(dstCluster);
                combo.push({
                  id: dstCluster+"-c",
                  label: dstCluster,
                })
              }
              // source 네임스페이스 추가
              const src_id = srcCluster+"/"+srcNamespace;
              if(!ns_seen.has(src_id)){
                ns_seen.add(src_id);
                combo.push({
                  id: src_id,
                  label: srcNamespace,
                  parentId: srcCluster+"-c",
                })
              }
              // destination 네임스페이스 추가
              const dst_id = dstCluster+"/"+dstNamespace;
              if(!ns_seen.has(dst_id)){
                ns_seen.add(dst_id);
                combo.push({
                  id: dst_id,
                  label: dstNamespace,
                  parentId: dstCluster+"-c",
                })
              }
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
                type: "image",
                ip: srcIP,
                name: srcName,
                kind: srcType,
                cluster: srcCluster,
                namespace: srcNamespace,
                comboId: (checkedBoxItems.namespace) ? srcCluster+"/"+srcNamespace : srcCluster+"-c",
                ...style
              });
            }
            if(!seen.has(dstIP)){
              seen.add(dstIP);
              const style = getNodeStyle(dstType);
              node.push({
                id: dstName,
                label: dstName,
                type: "image",
                ip: dstIP,
                name: dstName,
                kind: dstType,
                cluster: dstCluster,
                namespace: dstNamespace,
                comboId: (checkedBoxItems.namespace) ? dstCluster+"/"+dstNamespace : dstCluster+"-c",
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
              // label: srcPort+"→"+dstPort,
            })
          })
          const graphData = {
            nodes: node,
            edges: edge,
            combos: combo
          }
          setTopologyData(graphData)
          // console.log("graphData: ", graphData);
        })
        .catch((error) => {
          console.error("Error fetching clusters:", error);
        });
      }
  }, [checkedBoxItems , selectedNamespaces , timeRange]);

  
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
    if (cluster && namespace) return <ClusterTopology3 data={topologyData} />; // Custer + Namespace ComboBox
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
          onTimeRangeChange={hanldeTimeRangeChange}
          onIntervalTimeChange={handleIntervalTimeChange}
          checkedBoxItems={checkedBoxItems}
          onCheckboxChange={handleCheckboxChange}
        />
        </div>
        <div className="content" style={{ height: `${100 - tableHeight}vh`, position: "relative" }}>
        {/* <Topology2 data={topologyData} width={1000} height={600} selectedNamespace={selectedNamespace} selectedLog={logData}/> */}
        {/* {renderTopologyComponent()} */}
        {selectedNamespaces.length === 0 ? <div>Select Namespace</div> : renderTopologyComponent()}
        </div>

        {/* ✅ 리사이즈 핸들 */}
        {/* <div className="resize-handle" onMouseDown={startResizing}></div> */}

        {/* ✅ 아래쪽 테이블 (높이 조절 가능) */}
        <div className="table-container" style={{ height: `${tableHeight}vh`}}>
          <Log logEntries={logEntries}/>
        </div>
      </div>
    </div>
  );
};

export default Main;
