import React from "react";
import { Table } from "react-bootstrap";
import "./Log.css";

const Log = ({ logEntries}) => {
  const handleMouseEnter = (logData) => {
    // console.log("Hovered Log Data:", logData);
    // 원하는 이벤트 처리 (예: 상태 업데이트, API 요청 등)
    // onLogHover(logData);
  };

  return (
    <div className="table-wrapper">
      <Table className="custom-table">
        <thead>
          <tr style={{border: "1px solid #ccc"}}>
            <th rowSpan="2" style={{border: "1px solid #ccc" , verticalAlign: "middle"}}>TimeStamp</th>
            <th colSpan="4" style={{border: "1px solid #ccc"}}>Source</th>
            <th colSpan="4" style={{border: "1px solid #ccc"}}>Destination</th>
            <th colSpan="2" style={{border: "1px solid #ccc"}}>API Logs</th>
          </tr>
          <tr>
            {/* <th style={{border: "1px solid #ccc"}}>Timestamp</th> */}
            <th style={{borderLeft: "1px solid #ccc"}}>Cluster</th>
            <th>Type</th>
            <th className="source">Name<em>namespace</em></th>
            <th>IP:Port</th>
            <th style={{borderLeft: "1px solid #ccc"}}>Cluster</th>
            <th>Type</th>
            <th className="destination">Name<em>namespace</em></th>
            <th>IP:PORT</th>
            <th style={{borderLeft: "1px solid #ccc"}}>Method<em>path</em></th>
            <th style={{borderRight: "1px solid #ccc"}}>Response Code</th>
          </tr>
        </thead>
        <tbody>
          {logEntries && Array.isArray(logEntries) ? (
            logEntries.map((entry, index) => (
              <tr key={index} className="hover-effect" onMouseEnter={() => handleMouseEnter(entry)}>
                <td>{entry.timeStamp}</td>
                <td><span>{entry.srcCluster ? entry.srcCluster : "-"}</span></td>
                <td><span>{entry.srcType ? entry.srcType : "-"}</span></td>
                <td><span>{entry.srcName}<em>{entry.srcNamespace}</em></span></td>
                <td><span>{entry.srcIP}:{entry.srcPort}</span></td>
                <td><span>{entry.dstCluster ? entry.dstCluster : "-"}</span></td>
                <td><span>{entry.srcType ? entry.srcType : "-"}</span></td>
                <td><span>{entry.dstName}<em>{entry.dstNamespace}</em></span></td>
                <td><span>{entry.dstIP}:{entry.dstPort}</span></td>
                <td><span>{entry.method}<em>{entry.path}</em></span></td>
                <td><span>{entry.responseCode}</span></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #ccc"}}>
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
