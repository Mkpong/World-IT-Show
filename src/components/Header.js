import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Help from "./Help"; // 도움말 컴포넌트 import

// 클러스터 데이터
const clusterData = {
  clusterA: ["namespace1", "namespace2", "namespaceX"],
  clusterB: ["namespace3", "namespace4", "namespaceY", "namespaceZ"],
};

// 전체 네임스페이스 리스트
const allOptions = Object.entries(clusterData).flatMap(([clusterName, namespaces]) =>
  namespaces.map((ns) => ({
    value: `${clusterName}/${ns}`,
    label: ns,
  }))
);

// ✔️ 선택된 항목에 체크 마크 커스텀
const CustomOption = (props) => {
  const { data, isSelected } = props;
  return (
    <components.Option {...props}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{data.label}</span>
        {isSelected && <span>✔️</span>}
      </div>
    </components.Option>
  );
};

// 📦 커스텀 MenuList: Select All 버튼 추가
const CustomMenuList = (props) => {
  const {
    children,
    selectProps: { onSelectNamespaceChange, selectedNamespaces },
  } = props;

  const isAllSelected = selectedNamespaces.length === allOptions.length;

  const handleSelectAll = () => {
    if (!isAllSelected) {
      onSelectNamespaceChange(allOptions);
    }
  };

  return (
    <components.MenuList {...props}>
      {!isAllSelected && (
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #ddd",
            cursor: "pointer",
            fontWeight: "bold",
            backgroundColor: "#f0f0f0",
          }}
          onClick={handleSelectAll}
        >
          Select All
        </div>
      )}
      {children}
    </components.MenuList>
  );
};

// 🧩 Header 컴포넌트
const Header = ({ selectedNamespaces, onSelectNamespaceChange }) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    console.log("Header re-rendered");
    console.log(selectedNamespaces);
  }, [selectedNamespaces]);

  const groupedOptions = Object.entries(clusterData).map(([clusterName, namespaces]) => ({
    label: clusterName,
    options: namespaces.map((ns) => ({
      value: `${clusterName}/${ns}`,
      label: ns,
    })),
  }));

  return (
    <div
      style={{
        position: "relative",
        padding: "12px 20px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <div style={{ width: "600px" }}>
        <Select
          isMulti
          options={groupedOptions}
          value={selectedNamespaces}
          onChange={onSelectNamespaceChange}
          placeholder="Select Namespace"
          components={{
            Option: CustomOption,
            MenuList: CustomMenuList,
          }}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          styles={{
            valueContainer: (base) => ({
              ...base,
              flexWrap: "wrap",          // ✅ 아래로 줄바꿈
              overflow: "visible",
              maxHeight: "unset",
              alignItems: "flex-start",
            }),
            control: (base) => ({
              ...base,
              minHeight: "auto",
              minWidth: "600px",         // ✅ 고정 너비
              maxWidth: "100%",
              flexWrap: "wrap",          // ✅ 줄바꿈
            }),
            multiValue: (base) => ({
              ...base,
              margin: "4px 4px",
            }),
          }}
          selectedNamespaces={selectedNamespaces}
          onSelectNamespaceChange={onSelectNamespaceChange}
        />
      </div>

      {/* ? 아이콘 버튼 */}
      <button
        onClick={() => setShowHelp(true)}
        style={{
          fontSize: "18px",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          cursor: "pointer",
          textAlign: "center",
          marginTop: "3px",
        }}
        title="도움말"
      >
        ?
      </button>

      {/* Help 팝업 표시 */}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default Header;
