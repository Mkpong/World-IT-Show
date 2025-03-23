import React from "react";

const GraphBottom = ({ checkedBoxItems, onCheckboxChange }) => {
  return (
    <div
      className="topology-header"
      style={{
        width: "100%",
        padding: "5px 10px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
        fontWeight: "bold",
        fontSize: "16px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "12px", fontWeight: "normal", fontSize: "14px" }}>
        <label>
          <input
            type="checkbox"
            value="cluster"
            checked={checkedBoxItems.cluster}
            onChange={onCheckboxChange}
            style={{ marginRight: "5px" }}
          />
          Cluster Box
        </label>
        <label>
          <input
            type="checkbox"
            value="namespace"
            checked={checkedBoxItems.namespace}
            onChange={onCheckboxChange}
            style={{ marginRight: "5px" }}
          />
          Namespace Box
        </label>
      </div>
    </div>
  );
};

export default GraphBottom;
