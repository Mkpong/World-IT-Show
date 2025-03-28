import React, { useState } from "react";
import { Image } from "react-bootstrap";
import { CaretDownFill, CaretRightFill } from "react-bootstrap-icons";
import "./Sidebar.css";
import { HouseFill } from "react-bootstrap-icons";
import { FileEarmarkImage, PersonWorkspace, JournalText } from "react-bootstrap-icons";

const Sidebar = ({ isOpen }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (key) => {
    setActiveMenu((prev) => (prev === key ? null : key));
  };

  const handleClick = (item) => {
    console.log("Clicked:", item.key);
    // 예: navigate(item.route) 등으로 연결 가능
  };
  const iconSize = 22;

  const menus = [
    {
      label: "Dashboard",
      key: "dashboard",
      hasSubmenu: false,
      icon: <HouseFill size={iconSize} />,
    },
    {
      label: "Images",
      key: "images",
      hasSubmenu: false,
      icon: <FileEarmarkImage size={iconSize} />,
    },
    {
      label: "Workloads",
      key: "workloads",
      hasSubmenu: false,
      icon: <PersonWorkspace size={iconSize} />,
    },
    {
      label: "Policies",
      key: "policies", // ✅ 중복 key 수정
      hasSubmenu: true,
      icon: <JournalText size={iconSize} />,
      submenus: [
        { label: "Assurance Policies", key: "assurance-policies" },
        { label: "Runtime Policies", key: "runtime-policies" },
        { label: "Image Profiles", key: "image-profiles" },
        { label: "Container Firewall", key: "container-firewall" },
      ]
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* 푸터 로고 */}
      <div className="sidebar-header">
        <Image src="/boanLab-Logo-white.png" className="header-logo" />
      </div>

      {/* 상단 로고 - 메뉴 구분선 */}
      <div className="sidebar-divider" />

      {/* 메뉴 섹션 */}
      <div className="menu-section">
        {menus.map((menu) => (
          <div key={menu.key}>
            <div
              className="sidebar-menu"
              onClick={() => menu.hasSubmenu ? toggleMenu(menu.key) : handleClick(menu)}
            >
              <span className="menu-icon-left">{menu.icon}</span>
              <span className="menu-label">{menu.label}</span>
              {menu.hasSubmenu && (
                <span className="menu-icon">
                  {activeMenu === menu.key ? <CaretDownFill /> : <CaretRightFill />}
                </span>
              )}
            </div>
            {menu.hasSubmenu && activeMenu === menu.key && (
              <div className="submenu">
                {menu.submenus.map((item) => (
                  <div
                    key={item.key}
                    className="submenu-item"
                    onClick={() => handleClick(item)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 헤더 */}
      <div className="sidebar-footer">
        <div className="logo-container">
          <Image src="/KubeCarto.png" className="logo" style={{ width: "70%" }} />
          <h5 className="site-name">KubeCarto</h5>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
