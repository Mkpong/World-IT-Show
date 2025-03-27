import React from "react";
import { ArrowDown } from "react-bootstrap-icons";
import "./EdgePopup.css";

const EdgePopup = ({ x, y, edge, onClose }) => {
  if (!edge) return null;

  return (
    <div
      className="edge-popup"
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="edge-popup-close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <strong>Source</strong>
      <table className="edge-popup-table">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{edge.srcName}</td>
          </tr>
          <tr>
            <td>Namespace</td>
            <td>{edge.srcNamespace}</td>
          </tr>
          <tr>
            <td>IP:Port</td>
            <td>{edge.srcIP}:{edge.srcPort}</td>
          </tr>
          <tr>
            <td>Method</td>
            <td>{edge.method}</td>
          </tr>
          <tr>
            <td>Path</td>
            <td>{edge.path}</td>
          </tr>
        </tbody>
      </table>

      <ArrowDown size={24} className="edge-popup-arrow" />

      <strong>Destination</strong>
      <table className="edge-popup-table">
        <tbody>
          <tr>
            <td>Name</td>
            <td>{edge.dstName}</td>
          </tr>
          <tr>
            <td>Namespace</td>
            <td>{edge.dstNamespace}</td>
          </tr>
          <tr>
            <td>IP:Port</td>
            <td>{edge.dstIP}:{edge.dstPort}</td>
          </tr>
          <tr>
            <td>Response</td>
            <td className="edge-popup-response">{edge.responseCode}</td>
          </tr>
        </tbody>
      </table>

      <div className="edge-popup-divider" />
      <div>{edge.timeStamp}</div>
    </div>
  );
};

export default EdgePopup;
