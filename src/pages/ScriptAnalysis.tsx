/**
 * 剧本分析 — 各剧本的场次、营收、玩家数对比.
 */
import { useEffect, useState } from "react";
import { Card, Select, Spin, Empty, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ReactECharts from "echarts-for-react";
import { api, TopScript } from "../api/client";

const PERIOD_OPTIONS = [
  { value: "rolling_30d", label: "近30天" },
  { value: "rolling_90d", label: "近90天" },
  { value: "rolling_365d", label: "近一年" },
];

export default function ScriptAnalysis() {
  const [period, setPeriod] = useState("rolling_90d");
  const [scripts, setScripts] = useState<TopScript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getTopScripts(period, 20).then((data) => {
      setScripts(data.scripts);
      setLoading(false);
    });
  }, [period]);

  const columns: ColumnsType<TopScript> = [
    {
      title: "排名",
      key: "rank",
      width: 60,
      render: (_, __, i) => (
        <Typography.Text strong style={{ color: i < 3 ? "#f5222d" : "#666" }}>
          #{i + 1}
        </Typography.Text>
      ),
    },
    { title: "剧本", dataIndex: "name", key: "name" },
    {
      title: "场次",
      dataIndex: "session_count",
      key: "count",
      sorter: (a, b) => a.session_count - b.session_count,
    },
    {
      title: "总营收",
      dataIndex: "total_revenue",
      key: "revenue",
      render: (v: number) => `¥${v.toFixed(0)}`,
      sorter: (a, b) => a.total_revenue - b.total_revenue,
    },
    {
      title: "场均营收",
      dataIndex: "avg_revenue",
      key: "avg",
      render: (v: number) => `¥${v.toFixed(0)}`,
    },
    {
      title: "平均人数",
      dataIndex: "avg_players",
      key: "players",
      render: (v: number) => `${v.toFixed(1)}人`,
    },
  ];

  // 柱状图
  const barOption = scripts.length > 0
    ? {
        tooltip: { trigger: "axis" as const },
        grid: { left: 120, right: 30, top: 10, bottom: 30 },
        xAxis: {
          type: "value" as const,
          axisLabel: { formatter: (v: number) => `${v}` },
        },
        yAxis: {
          type: "category" as const,
          data: scripts.slice(0, 10).map((s) => s.name).reverse(),
          axisLabel: { width: 100, overflow: "truncate" },
        },
        series: [
          {
            name: "场次",
            type: "bar",
            data: scripts.slice(0, 10).map((s) => s.session_count).reverse(),
            itemStyle: {
              color: {
                type: "linear" as const,
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: "#1677ff" },
                  { offset: 1, color: "#69b1ff" },
                ],
              },
            },
          },
        ],
      }
    : null;

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;

  return (
    <div>
      <Select
        value={period}
        onChange={setPeriod}
        options={PERIOD_OPTIONS}
        style={{ width: 120, marginBottom: 24 }}
      />

      <Card title="📊 剧本场次排行" style={{ marginBottom: 24 }}>
        {barOption ? (
          <ReactECharts option={barOption} style={{ height: 360 }} />
        ) : (
          <Empty description="暂无场次数据" />
        )}
      </Card>

      <Card title="剧本明细">
        <Table
          columns={columns}
          dataSource={scripts}
          rowKey="name"
          size="middle"
          pagination={false}
          locale={{ emptyText: <Empty description="暂无剧本数据" /> }}
        />
      </Card>
    </div>
  );
}
