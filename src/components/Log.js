import React from "react";
import { Table } from "react-bootstrap";
import "./Log.css";

const Log = ({ onLogHover, logEntries}) => {
  const handleMouseEnter = (logData) => {
    // console.log("Hovered Log Data:", logData);
    // 원하는 이벤트 처리 (예: 상태 업데이트, API 요청 등)
    onLogHover(logData);
  };

  return (
    <div className="table-wrapper">
      <Table className="custom-table">
        <thead>
          <tr>
            {/* <th>Source Cluster</th> */}
            <th className="source">Source Pod<em>namespace</em></th>
            <th>Source IP:Port</th>
            {/* <th>Destination Cluster</th> */}
            <th className="destination">Destination Pod<em>namespace</em></th>
            <th>Destination IP:PORT</th>
            <th className="source">Method<em>path</em></th>
            <th>Response Code</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logEntries && Array.isArray(logEntries) ? (
            logEntries.map((entry, index) => (
              <tr key={index} className="hover-effect" onMouseEnter={() => handleMouseEnter(entry)}>
                <td><span className="source">{entry.srcName}<em>{entry.srcNamespace}</em></span></td>
                <td><span className="source">{entry.srcIP}:{entry.srcPort}</span></td>
                <td><span className="destination">{entry.dstName}<em>{entry.dstNamespace}</em></span></td>
                <td><span className="destination">{entry.dstIP}:{entry.dstPort}</span></td>
                <td><span className="source">{entry.method}<em>{entry.path}</em></span></td>
                <td><span className="verdict">{entry.responseCode}</span></td>
                <td>{entry.timeStamp}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                No logs available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default Log;
