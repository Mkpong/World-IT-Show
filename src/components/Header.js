import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Help from "./Help";

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
    selectProps: { onSelectNamespaceChange, selectedNamespaces, allOptions },
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

const Header = ({ selectedNamespaces, onSelectNamespaceChange, clusterInfo, onRefresh }) => {
  const [showHelp, setShowHelp] = useState(false);

  const groupedOptions = Object.entries(clusterInfo).map(
    ([clusterName, namespaceList]) => ({
      label: clusterName,
      options: namespaceList.map((ns) => ({
        clusterName,
        namespace: ns,
        value: `${clusterName}/${ns}`,
        label: ns,
      })),
    })
  );

  const allOptions = groupedOptions.flatMap(group => group.options);

  return (
    <div
      style={{
        position: "relative",
        padding: "12px 20px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      {/* 왼쪽: Select */}
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
          selectedNamespaces={selectedNamespaces}
          onSelectNamespaceChange={onSelectNamespaceChange}
          allOptions={allOptions}
          styles={{
            valueContainer: (base) => ({
              ...base,
              flexWrap: "wrap",
              overflow: "visible",
              maxHeight: "unset",
              alignItems: "flex-start",
            }),
            control: (base) => ({
              ...base,
              minHeight: "auto",
              minWidth: "600px",
              maxWidth: "100%",
              flexWrap: "wrap",
            }),
            multiValue: (base) => ({
              ...base,
              margin: "4px 4px",
            }),
          }}
        />
      </div>

      {/* 오른쪽: 버튼 그룹 */}
      <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
        {/* 🔁 새로고침 버튼 */}
        <button
          onClick={onRefresh}
          style={{
            fontSize: "14px",
            padding: "6px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            cursor: "pointer",
            marginTop: "3px",
          }}
        >
          🔁 새로고침
        </button>

        {/* ? 도움말 버튼 */}
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
      </div>

      {/* 도움말 팝업 */}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default Header;
