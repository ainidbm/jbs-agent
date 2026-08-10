import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout as AntLayout, Menu, Typography } from "antd";
import {
  DashboardOutlined,
  DollarOutlined,
  RiseOutlined,
  ReadOutlined,
  TrophyOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Sider, Content, Header } = AntLayout;

const menuItems = [
  { key: "/dashboard", icon: <DashboardOutlined />, label: "经营总览" },
  { key: "/financials", icon: <DollarOutlined />, label: "财务明细" },
  { key: "/trend", icon: <RiseOutlined />, label: "趋势预测" },
  { key: "/scripts", icon: <ReadOutlined />, label: "剧本分析" },
  { key: "/leaderboard", icon: <TrophyOutlined />, label: "排行榜" },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint="lg"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography.Text
            strong
            style={{
              color: "#fff",
              fontSize: collapsed ? 14 : 18,
              whiteSpace: "nowrap",
            }}
          >
            {collapsed ? "JBS" : "🎭 剧本杀管家"}
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <AntLayout style={{ marginLeft: collapsed ? 80 : 200, transition: "margin-left 0.2s" }}>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            zIndex: 99,
          }}
        >
          <span
            onClick={() => setCollapsed(!collapsed)}
            style={{ cursor: "pointer", fontSize: 18, marginRight: 24 }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </span>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {menuItems.find((m) => m.key === location.pathname)?.label || "经营面板"}
          </Typography.Title>
        </Header>
        <Content style={{ padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
