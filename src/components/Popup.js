import React from "react";

const Popup = ({ x, y, node, onClose }) => {
  if (!node) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: y,
        left: x,
        backgroundColor: "#fff",
        border: "1px solid #999",
        padding: "12px 16px 10px 16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 10,
        borderRadius: "8px",
        minWidth: "350px",
        fontSize: "14px",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 닫기 X 버튼 */}
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
      
      <strong>{node.kind}</strong>
      <table className="edge-popup-table">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{node.label}</td>
          </tr>
          <tr>
            <td>Cluster</td>
            <td>{node.cluster}</td>
          </tr>
          <tr>
            <td>Namespace</td>
            <td>{node.namespace}</td>
          </tr>
          <tr>
            <td>IP</td>
            <td>{node.ip}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Popup;
