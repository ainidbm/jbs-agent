/**
 * 趋势预测 — 历史趋势 + 预测 + 归因分析.
 */
import { useEffect, useState } from "react";
import { Row, Col, Card, Spin, Empty, Alert, Typography, Descriptions } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { api, TrendData } from "../api/client";

export default function TrendPrediction() {
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTrend(18).then((data) => {
      setTrend(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spin size="large" style={{ display: "block", margin: "100px auto" }} />;
  if (!trend || trend.historical.length === 0)
    return <Empty description="暂无历史数据，录入数据满 3 周后将自动开启预测" />;

  // 完整趋势图 (历史 + 预测延伸)
  const option = {
    tooltip: { trigger: "axis" as const },
    legend: { data: ["营业额", "净利润", "预测营业额"], bottom: 0 },
    grid: { left: 30, right: 30, top: 20, bottom: 40 },
    xAxis: {
      type: "category" as const,
      data: [
        ...trend.historical.map((h) => h.month.slice(0, 7)),
        ...(trend.forecast ? [trend.forecast.month.slice(0, 7)] : []),
      ],
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => `¥${(v / 10000).toFixed(1)}万` },
    },
    series: [
      {
        name: "营业额",
        type: "line",
        data: trend.historical.map((h) => h.income),
        smooth: true,
        itemStyle: { color: "#1677ff" },
      },
      {
        name: "净利润",
        type: "line",
        data: trend.historical.map((h) => h.net_profit),
        smooth: true,
        itemStyle: { color: "#52c41a" },
      },
      ...(trend.forecast
        ? [
            {
              name: "预测营业额",
              type: "line" as const,
              data: [
                ...Array(trend.historical.length - 1).fill(null),
                trend.historical[trend.historical.length - 1].income,
                trend.forecast.predicted,
              ],
              smooth: true,
              lineStyle: { type: "dashed" as const, color: "#faad14" },
              itemStyle: { color: "#faad14" },
              areaStyle: trend.forecast.confidence_lower
                ? {
                    color: {
                      type: "linear" as const,
                      x: 0, y: 0, x2: 0, y2: 1,
                      colorStops: [
                        { offset: 0, color: "rgba(250,173,20,0.15)" },
                        { offset: 1, color: "rgba(250,173,20,0)" },
                      ],
                    },
                  }
                : undefined,
            },
          ]
        : []),
    ],
  };

  return (
    <Row gutter={[24, 24]}>
      {/* 趋势图 */}
      <Col span={24}>
        <Card title="📈 营业额趋势与预测">
          <ReactECharts option={option} style={{ height: 380 }} />
          {trend.forecast?.confidence_lower && (
            <Typography.Text type="secondary" style={{ marginTop: 8, display: "block" }}>
              虚线为预测值，浅色区域为 80% 置信区间
              (¥{trend.forecast.confidence_lower.toFixed(0)} ~ ¥{trend.forecast.confidence_upper?.toFixed(0)})
            </Typography.Text>
          )}
        </Card>
      </Col>

      {/* 归因分析 */}
      {trend.forecast?.narrative ? (
        <Col span={24}>
          <Card>
            <Typography.Title level={5}>
              <InfoCircleOutlined /> 归因分析
            </Typography.Title>
            <Alert
              type="info"
              message="AI 经营解读"
              description={trend.forecast.narrative}
              style={{ marginTop: 12 }}
            />
          </Card>
        </Col>
      ) : (
        <Col span={24}>
          <Card>
            <Typography.Title level={5}>归因分析</Typography.Title>
            <Alert
              type="warning"
              message="预测模型尚未就绪"
              description="需要至少 12 周的历史数据来训练预测模型。数据积累中，请持续录入经营数据。"
            />
          </Card>
        </Col>
      )}

      {/* 预测参数说明 */}
      <Col span={24}>
        <Card title="模型说明" size="small">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="模型">XGBoost 时序预测</Descriptions.Item>
            <Descriptions.Item label="可解释性">SHAP 因子归因</Descriptions.Item>
            <Descriptions.Item label="特征维度">周周期、年周期、节假日、移动平均、剧本库存</Descriptions.Item>
            <Descriptions.Item label="冷启动策略">12 周内混合同城先验</Descriptions.Item>
          </Descriptions>
        </Card>
      </Col>
    </Row>
  );
}
