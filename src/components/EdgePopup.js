// components/EdgePopup.js
import React from "react";
import { ArrowDown } from "react-bootstrap-icons";

const EdgePopup = ({ x, y, edge, onClose }) => {
  if (!edge) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: "#fff",
        border: "1px solid #999",
        padding: "12px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 10,
        borderRadius: "8px",
        minWidth: "180px",
        fontSize: "14px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "transparent",
          border: "none",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer",
          color: "#666",
        }}
        aria-label="Close"
      >
        ×
      </button>

      <strong>Source</strong>
      <div>{edge.srcName}({edge.srcNamespace})</div>
      <div>{edge.srcIP}:{edge.srcPort}</div>
      <div>{edge.method}  {edge.path}</div>
      <ArrowDown size={24} style={{ display: "block", margin: "4px auto" }} />
      <strong>Target</strong>
      <div>{edge.dstName}({edge.dstNamespace})</div>
      <div>{edge.dstIP}:{edge.dstPort}</div>
      <div style={{fontStyle: "italic", color: "red"}}>response: {edge.responseCode}</div>
      <div>--------------</div>
      <div>{edge.timeStamp}</div>

      {/* 필요한 추가 정보 여기에 표시 가능 */}
    </div>
  );
};
export default EdgePopup;
