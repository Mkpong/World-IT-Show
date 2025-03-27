// Header.js
import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import "./Header.css";
import { ArrowClockwise } from "react-bootstrap-icons";


// ✔️ 선택된 항목에 체크 마크 커스텀
const CustomOption = (props) => {
  const { data, isSelected } = props;
  return (
    <components.Option {...props}>
      <div className="custom-option">
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
        <div className="select-all" onClick={handleSelectAll}>
          Select All
        </div>
      )}
      {children}
    </components.MenuList>
  );
};

const CustomValueContainer = ({ children, ...props }) => {
  const { selectProps } = props;

  return (
    <components.ValueContainer {...props}>
      <div
        style={{
          width: "100%",
          textAlign: "center",
          opacity: 0.6,
          fontStyle: "italic",
          fontSize: "14px",
        }}
      >
        {selectProps.placeholder}
      </div>
    </components.ValueContainer>
  );
};


const Header = ({
  selectedNamespaces,
  onSelectNamespaceChange,
  clusterInfo,
  onRefresh,
  onTimeRangeChange,
  onIntervalTimeChange,
  checkedBoxItems,
  onCheckboxChange
}) => {

  const groupedOptions = Object.entries(clusterInfo).map(
    ([clusterName, namespaceList]) => ({
      label: clusterName,
      options: namespaceList.map((ns) => ({
        clusterName,
        namespace: ns,
        value: `${clusterName}/${ns.name || ns}`,
        label: ns.name || ns,
      })),
    })
  );

  const allOptions = groupedOptions.flatMap((group) => group.options);

  const timeOptions = [
    { value: "1m", label: "1m" },
    { value: "3m", label: "3m" },
    { value: "5m", label: "5m" },
    { value: "10m", label: "10m" },
    { value: "30m", label: "30m" },
    { value: "60m", label: "60m" },
  ];

  const refreshIntervalOptions = [
    { value: 0, label: "수동" },
    { value: 10000, label: "10초" },
    { value: 30000, label: "30초" },
    { value: 60000, label: "1분" },
  ];

  return (
    <div>
    <div className="header-container">
      <div className="namespace-select">
        <Select
          isMulti
          options={groupedOptions}
          value={selectedNamespaces}
          onChange={onSelectNamespaceChange}
          placeholder="Select Namespace"
          components={{ 
            Option: CustomOption, 
            MenuList: CustomMenuList,
            MultiValue: () => null,
            ValueContainer: CustomValueContainer
          }}
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          selectedNamespaces={selectedNamespaces}
          onSelectNamespaceChange={onSelectNamespaceChange}
          allOptions={allOptions}
          styles={{
            control: (base) => ({
              ...base,
              // minHeight: "auto",
              height: "38px",
              minWidth: "500px",
              maxWidth: "100%",
              flexWrap: "wrap",
            }),
          }}
        />
      </div>

      <div className="time-select">
        <Select
          options={timeOptions}
          defaultValue={timeOptions[0]}
          onChange={onTimeRangeChange}
          isSearchable={false}
          styles={{
            control: (base) => ({
              ...base,
              height: "38px",
              minHeight: "32px",
              fontSize: "12px",
            }),
            dropdownIndicator: (base) => ({
              ...base,
              padding: "4px",
            }),
            indicatorsContainer: (base) => ({
              ...base,
              height: "32px",
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "2px 6px",
            }),
          }}
        />
      </div>

      <div className="header-buttons">
        <div
          style={{
            width: "100%",
            fontSize: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "row",        // ✅ 수평 정렬
            alignItems: "center",
            gap: "16px",                 // ✅ 좌우 간격
          }}
        >
          <label style={{ display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              value="cluster"
              checked={checkedBoxItems.cluster}
              onChange={onCheckboxChange}
              style={{ marginRight: "5px" }}
            />
            Cluster Box
          </label>

          <label style={{ display: "flex", alignItems: "center" }}>
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
        <button className="refresh-button" onClick={onRefresh} title="새로고침">
          <ArrowClockwise size={30} />
        </button>
      </div>

      
    </div>
    {/* ✅ 선택된 네임스페이스를 아래에 표시 */}
    {selectedNamespaces.length !== 0 &&
    <div className="selected-tags">
      {selectedNamespaces.map((ns) => (
        <div key={ns.value} className="selected-tag">
          {ns.clusterName}: {ns.label}
          <span 
            className="remove-btn"
            onClick={() =>
              onSelectNamespaceChange(
                selectedNamespaces.filter((item) => item.value !== ns.value)
              )
            }
          >
            ×
          </span>
        </div>
      ))}
    </div>
    }
  </div>
  );
};

export default Header;