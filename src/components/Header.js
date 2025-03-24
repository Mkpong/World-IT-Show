import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Help from "./Help"; // 도움말 컴포넌트 import

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

// 🧩 Header 컴포넌트
const Header = ({ selectedNamespaces, onSelectNamespaceChange, clusterInfo }) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // console.log("selected:", selectedNamespaces);
    // console.log("clusterInfo:", clusterInfo);
  }, [selectedNamespaces, clusterInfo]);

  // ✅ 그룹 옵션 구성
  const groupedOptions = Object.entries(clusterInfo).map(
    ([clusterName, namespaceList]) => ({
      label: clusterName,
      options: namespaceList.map((ns) => ({
        clusterName: clusterName,
        namespace: ns,
        value: `${clusterName}/${ns}`,
        label: ns,
      })),
    })
  );

  // ✅ 전체 옵션 리스트 (Select All에 사용)
  const allOptions = groupedOptions.flatMap(group => group.options);

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
          selectedNamespaces={selectedNamespaces} // CustomMenuList 용
          onSelectNamespaceChange={onSelectNamespaceChange} // CustomMenuList 용
          allOptions={allOptions} // ✅ CustomMenuList 용
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
