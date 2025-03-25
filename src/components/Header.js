// Header.js
import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";
import Help from "./Help";
import "./Header.css";

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

const Header = ({
  selectedNamespaces,
  onSelectNamespaceChange,
  clusterInfo,
  onRefresh,
  onTimeRangeChange,
}) => {
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

  const allOptions = groupedOptions.flatMap((group) => group.options);

  const timeOptions = [
    { value: "1m", label: "1m" },
    { value: "3m", label: "3m" },
    { value: "5m", label: "5m" },
    { value: "10m", label: "10m" },
    { value: "30m", label: "30m" },
    { value: "60m", label: "60m" },
  ];

  return (
    <div className="header-container">
      <div className="namespace-select">
        <Select
          isMulti
          options={groupedOptions}
          value={selectedNamespaces}
          onChange={onSelectNamespaceChange}
          placeholder="Select Namespace"
          components={{ Option: CustomOption, MenuList: CustomMenuList }}
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

      <div className="time-select">
        <Select
          options={timeOptions}
          defaultValue={timeOptions[0]}
          onChange={onTimeRangeChange}
          isSearchable={false}
          styles={{
            control: (base) => ({
              ...base,
              height: "32px",
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
        <button className="refresh-button" onClick={onRefresh} title="새로고침">
          🔄
        </button>
        <button
          className="help-button"
          onClick={() => setShowHelp(true)}
          title="도움말"
        >
          ?
        </button>
      </div>

      {showHelp && <Help onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default Header;