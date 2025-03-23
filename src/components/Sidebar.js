import React, { useState } from "react";
import { ListGroup, Image, Button } from "react-bootstrap";
import { ChevronDown, ChevronRight } from "react-bootstrap-icons";
import "./Sidebar.css";

const Sidebar = ({ isOpen, clusterNamespaces, onNamespaceClick }) => {
  // 여러 개의 열린 클러스터를 저장하는 배열
  const [openClusters, setOpenClusters] = useState([]);

  // 클릭 시 해당 클러스터를 토글
  const toggleCluster = (cluster) => {
    setOpenClusters((prev) =>
      prev.includes(cluster)
        ? prev.filter((item) => item !== cluster) // 이미 열려 있으면 닫기
        : [...prev, cluster] // 닫혀 있으면 추가
    );
  };

  // Cluster overview 버튼 클릭 시 전체 클러스터 정보 화면 띄우기
  const handleClusterOverview = () => {
    alert("Cluster Overview 버튼이 클릭되었습니다!"); // 원하는 기능으로 변경 가능
  };

  // 네임스페이스 클릭 핸들러
  const handleNamespaceClick = (cluster, namespace) => {
    onNamespaceClick({cluster, namespace});
  };

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* 로고 & 사이트 이름 */}
      <div className="sidebar-header">
        <div className="logo-container">
          <Image src="/dku-logo.png" className="logo" style={{ width: "70%" }} />
          <h5 className="site-name">Kubebowl</h5> {/* ✅ 로고 아래에 배치 */}
        </div>
      </div>

      {/* Clusters Overview 버튼 */}
      <Button className="clusters-overview-btn" onClick={handleClusterOverview}>
        Clusters Overview
      </Button>
    </div>
  );
};

export default Sidebar;
