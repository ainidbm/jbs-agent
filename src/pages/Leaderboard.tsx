/**
 * 热门剧本排行榜 — 跨店排名, 按地域分区.
 */
import { useEffect, useState } from "react";
import { Card, Select, Table, Tag, Empty, Typography, Alert } from "antd";
import { TrophyOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { api, LeaderboardScript, LeaderboardResult } from "../api/client";

const CITY_OPTIONS = [
  { value: "桐城", label: "桐城" },
  { value: "芜湖", label: "芜湖" },
  { value: "", label: "全省" },
];

const PERIOD_OPTIONS = [
  { value: 30, label: "近30天" },
  { value: 90, label: "近90天" },
  { value: 365, label: "近一年" },
];

export default function Leaderboard() {
  const [city, setCity] = useState("桐城");
  const [periodDays, setPeriodDays] = useState(90);
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.getLeaderboard({
      city: city || undefined,
      province: "安徽",
      period_days: periodDays,
      top_n: 30,
    }).then((d) => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, [city, periodDays]);

  const columns: ColumnsType<LeaderboardScript> = [
    {
      title: "排名",
      dataIndex: "rank",
      key: "rank",
      width: 70,
      render: (rank: number) => {
        const colors: Record<number, string> = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
        if (rank <= 3 && colors[rank]) {
          return (
            <Typography.Text strong style={{ color: colors[rank], fontSize: 18 }}>
              <TrophyOutlined /> {rank}
            </Typography.Text>
          );
        }
        return <Typography.Text type="secondary">{rank}</Typography.Text>;
      },
    },
    {
      title: "剧本名称",
      dataIndex: "script_name",
      key: "name",
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: "总场次",
      dataIndex: "total_sessions",
      key: "sessions",
      sorter: (a, b) => a.total_sessions - b.total_sessions,
    },
    {
      title: "总营收",
      dataIndex: "total_revenue",
      key: "revenue",
      render: (v: number) => `¥${v.toFixed(0)}`,
      sorter: (a, b) => a.total_revenue - b.total_revenue,
    },
    {
      title: "近两周",
      dataIndex: "recent_sessions",
      key: "recent",
      render: (v: number) => (
        <Tag color={v > 3 ? "red" : v > 0 ? "orange" : "default"}>{v} 场</Tag>
      ),
    },
    {
      title: "热度分",
      dataIndex: "hot_score",
      key: "hot",
      sorter: (a, b) => a.hot_score - b.hot_score,
      render: (s: number) => {
        const color = s > 0.7 ? "#f5222d" : s > 0.4 ? "#fa8c16" : "#8c8c8c";
        return <Typography.Text style={{ color, fontWeight: 700 }}>{(s * 100).toFixed(0)}</Typography.Text>;
      },
    },
  ];

  return (
    <div>
      {/* 过滤栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Typography.Text strong>地域：</Typography.Text>
          <Select value={city} onChange={setCity} options={CITY_OPTIONS} style={{ width: 120 }} />
          <Typography.Text strong style={{ marginLeft: 16 }}>周期：</Typography.Text>
          <Select value={periodDays} onChange={setPeriodDays} options={PERIOD_OPTIONS} style={{ width: 120 }} />
        </div>
      </Card>

      {/* 范围提示 */}
      {data?.scope && data.scripts.length > 0 && (
        <Alert
          message={data.scope}
          type={data.scope_type === "province" ? "warning" : "info"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 排行榜表格 */}
      <Card title={`🏆 ${data?.scope || "热门剧本排行榜"}`}>
        <Table
          columns={columns}
          dataSource={data?.scripts || []}
          rowKey="script_name"
          size="middle"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 个剧本` }}
          locale={{ emptyText: <Empty description="暂无排行数据" /> }}
        />
      </Card>
    </div>
  );
}
