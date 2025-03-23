// Help.js
import React from "react";

const Help = ({ onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        right: "20px",
        width: "300px",
        padding: "16px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px" }}>도움말</div>
      <p style={{ fontSize: "14px", lineHeight: "1.4" }}>
        네임스페이스를 선택하면 해당 토폴로지 정보를 시각화할 수 있습니다.<br />
        <br />
        <b>Select All</b>을 누르면 전체 네임스페이스가 선택됩니다.
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: "12px",
          padding: "6px 12px",
          backgroundColor: "#aaa",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        닫기
      </button>
    </div>
  );
};

export default Help;
