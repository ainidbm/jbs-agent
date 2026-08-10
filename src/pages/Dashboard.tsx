/**
 * Dashboard — progressive rendering with skeleton -> data transition.
 *
 * First-paint strategy:
 *   1. Render skeleton cards immediately (no API wait)
 *   2. Fire 3 API calls in parallel
 *   3. Populate KPI cards as soon as data resolves
 *   4. Defer chart rendering (rAF) to keep first paint fast
 */
import { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Select, Empty, Typography } from "antd";
import {
  DollarOutlined,
  RiseOutlined,
  ScheduleOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { api, KPIMetrics, TrendData, TopScript } from "../api/client";
import { KpiSkeleton, ChartSkeleton } from "../components/Skeleton";

// Lazy-load ECharts only when data is ready
let ReactECharts: any = null;
async function loadChart() {
  if (!ReactECharts) {
    ReactECharts = (await import("echarts-for-react")).default;
  }
  return ReactECharts;
}

const PERIOD_OPTIONS = [
  { value: "current_month", label: "本月" },
  { value: "last_month", label: "上月" },
  { value: "rolling_30d", label: "近30天" },
  { value: "rolling_90d", label: "近90天" },
];

export default function Dashboard() {
  const [period, setPeriod] = useState("current_month");
  const [kpi, setKpi] = useState<KPIMetrics | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [topScripts, setTopScripts] = useState<TopScript[]>([]);
  const [phase, setPhase] = useState<"skeleton" | "kpi_ready" | "charts_ready">("skeleton");
  const [ChartComp, setChartComp] = useState<any>(null);

  useEffect(() => {
    // Reset to skeleton on period change
    setPhase("skeleton");

    // Fire all requests in parallel — the single biggest perf win
    Promise.all([
      api.getKPI(period),
      api.getTrend(),
      api.getTopScripts(),
    ]).then(([kpiData, trendData, scriptsData]) => {
      // Phase 1: populate KPIs immediately (text-only, fast)
      setKpi(kpiData);
      setTopScripts(scriptsData.scripts);
      setPhase("kpi_ready");

      // Phase 2: defer chart rendering to next frame
      requestAnimationFrame(() => {
        setTrend(trendData);
        setPhase("charts_ready");
      });
    });

    // Preload ECharts in background
    loadChart().then((comp) => setChartComp(() => comp));
  }, [period]);

  // ── Trend chart config ──
  const trendOption = trend
    ? {
        tooltip: { trigger: "axis" as const },
        legend: { data: ["营业额", "净利润"], bottom: 0 },
        grid: { left: 20, right: 30, top: 20, bottom: 40 },
        xAxis: {
          type: "category" as const,
          data: trend.historical.map((h) => h.month.slice(0, 7)),
          axisLabel: { rotate: 45 },
        },
        yAxis: {
          type: "value" as const,
          axisLabel: { formatter: (v: number) => `¥${(v / 10000).toFixed(1)}万` },
        },
        series: [
          {
            name: "营业额", type: "line",
            data: trend.historical.map((h) => h.income),
            smooth: true, lineStyle: { width: 2 },
            itemStyle: { color: "#1677ff" },
          },
          {
            name: "净利润", type: "line",
            data: trend.historical.map((h) => h.net_profit),
            smooth: true, lineStyle: { width: 2 },
            itemStyle: { color: "#52c41a" },
          },
          ...(trend.forecast
            ? [{
                name: "预测营业额", type: "line" as const,
                data: [
                  ...Array(trend.historical.length - 1).fill(null),
                  trend.historical[trend.historical.length - 1]?.income,
                  trend.forecast.predicted,
                ],
                lineStyle: { type: "dashed" as const, width: 2 },
                itemStyle: { color: "#faad14" },
                smooth: true,
              }]
            : []),
        ],
      }
    : null;

  return (
    <div>
      <Select
        value={period}
        onChange={setPeriod}
        options={PERIOD_OPTIONS}
        style={{ width: 120, marginBottom: 24 }}
      />

      {/* KPI Cards — skeleton or real */}
      {phase === "skeleton" && !kpi ? (
        <KpiSkeleton />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic title="营业额" value={kpi?.metrics.total_income || 0}
                precision={0} prefix={<DollarOutlined />} suffix="元"
                valueStyle={{ color: "#1677ff" }} />
              {kpi?.changes.income_change_pct != null && <ChangeBadge pct={kpi.changes.income_change_pct} />}
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic title="净利润" value={kpi?.metrics.net_profit || 0}
                precision={0} prefix={<RiseOutlined />} suffix="元"
                valueStyle={{ color: (kpi?.metrics.net_profit || 0) >= 0 ? "#52c41a" : "#ff4d4f" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic title="场次" value={kpi?.metrics.session_count || 0}
                prefix={<ScheduleOutlined />} suffix="场"
                valueStyle={{ color: "#722ed1" }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card hoverable>
              <Statistic title="客单价" value={kpi?.metrics.avg_revenue_per_session || 0}
                precision={0} prefix={<UserOutlined />} suffix="元/场"
                valueStyle={{ color: "#fa8c16" }} />
            </Card>
          </Col>
        </Row>
      )}

      {/* Trend chart — skeleton or real */}
      {phase !== "charts_ready" && !trend ? (
        <Card title="经营趋势" style={{ marginBottom: 24 }}>
          <ChartSkeleton height={340} />
        </Card>
      ) : trendOption && ChartComp ? (
        <Card title="经营趋势" style={{ marginBottom: 24 }}>
          <ChartComp option={trendOption} style={{ height: 360 }}
            opts={{ renderer: "canvas" }} />
          {trend?.forecast?.narrative && (
            <Typography.Paragraph type="secondary"
              style={{ marginTop: 12, padding: "8px 12px", background: "#fafafa", borderRadius: 6 }}>
              📈 {trend.forecast.narrative}
            </Typography.Paragraph>
          )}
        </Card>
      ) : (
        <Card title="经营趋势" style={{ marginBottom: 24 }}>
          <Empty description="暂无趋势数据" />
        </Card>
      )}

      {/* Script TOP5 — render immediately with KPI data */}
      <Card title="热门剧本 TOP5">
        {topScripts.length > 0 ? (
          <Row gutter={[12, 12]}>
            {topScripts.map((s, i) => (
              <Col xs={24} sm={12} md={24 / 5} key={s.name}>
                <Card size="small" style={{ textAlign: "center" }}>
                  <Typography.Text strong style={{
                    fontSize: 24,
                    color: i === 0 ? "#f5222d" : i === 1 ? "#fa8c16" : i === 2 ? "#fadb14" : "#8c8c8c",
                  }}>#{i + 1}</Typography.Text>
                  <Typography.Title level={5} style={{ margin: "4px 0" }}>{s.name}</Typography.Title>
                  <Typography.Text type="secondary">
                    {s.session_count} 场 · ¥{s.avg_revenue.toFixed(0)}/场
                  </Typography.Text>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无场次数据" />
        )}
      </Card>
    </div>
  );
}

function ChangeBadge({ pct }: { pct: number }) {
  if (Math.abs(pct) < 0.5) {
    return <Typography.Text type="secondary" style={{ fontSize: 12 }}><MinusOutlined /> 持平</Typography.Text>;
  }
  if (pct > 0) {
    return <Typography.Text style={{ color: "#52c41a", fontSize: 12 }}><ArrowUpOutlined /> 环比 +{pct}%</Typography.Text>;
  }
  return <Typography.Text style={{ color: "#ff4d4f", fontSize: 12 }}><ArrowDownOutlined /> 环比 {pct}%</Typography.Text>;
}
