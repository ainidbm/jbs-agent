/**
 * 财务明细 — 流水列表 + 按类别汇总环形图.
 */
import { useEffect, useState } from "react";
import { Row, Col, Card, Table, Select, Tag, Empty, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import { api, FinancialRecord, CategorySummary } from "../api/client";

const TYPE_OPTIONS = [
  { value: "income", label: "收入" },
  { value: "expense", label: "支出" },
];

export default function Financials() {
  const [recordType, setRecordType] = useState<"income" | "expense">("income");
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getFinancialRecords({ record_type: recordType, page, page_size: 20 }),
      api.getCategorySummary(recordType),
    ]).then(([recordsPage, summary]) => {
      setRecords(recordsPage.records);
      setTotal(recordsPage.total);
      setCategorySummary(summary.categories);
      setLoading(false);
    });
  }, [recordType, page]);

  const columns: ColumnsType<FinancialRecord> = [
    {
      title: "日期",
      dataIndex: "record_date",
      key: "date",
      width: 120,
      render: (d: string) => dayjs(d).format("MM-DD"),
      sorter: (a, b) => a.record_date.localeCompare(b.record_date),
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (c: string) => <Tag>{c}</Tag>,
    },
    {
      title: "金额",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (a: number) => (
        <Typography.Text
          strong
          style={{ color: recordType === "income" ? "#52c41a" : "#ff4d4f" }}
        >
          {recordType === "income" ? "+" : "-"}¥{a.toFixed(2)}
        </Typography.Text>
      ),
    },
    { title: "备注", dataIndex: "description", key: "desc", ellipsis: true },
    { title: "录入人", dataIndex: "recorded_by", key: "by", width: 100 },
  ];

  // 环形图
  const pieOption = {
    tooltip: { trigger: "item" as const, formatter: "{b}: ¥{c} ({d}%)" },
    legend: { bottom: 0, type: "scroll" as const },
    series: [
      {
        type: "pie",
        radius: ["45%", "75%"],
        center: ["50%", "45%"],
        data: categorySummary.map((c) => ({
          name: c.category,
          value: c.total,
        })),
        label: { show: false },
        emphasis: { label: { show: true } },
      },
    ],
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={16}>
        <Card
          title="流水明细"
          extra={
            <Select
              value={recordType}
              onChange={setRecordType}
              options={TYPE_OPTIONS}
              style={{ width: 100 }}
            />
          }
        >
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            size="middle"
            loading={loading}
            pagination={{
              current: page,
              total,
              pageSize: 20,
              onChange: setPage,
              showTotal: (t) => `共 ${t} 条`,
            }}
            locale={{ emptyText: <Empty description="暂无流水数据" /> }}
          />
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card title={`${recordType === "income" ? "收入" : "支出"}分布`}>
          {categorySummary.length > 0 ? (
            <ReactECharts option={pieOption} style={{ height: 360 }} />
          ) : (
            <Empty description="暂无数据" />
          )}
        </Card>
      </Col>
    </Row>
  );
}
