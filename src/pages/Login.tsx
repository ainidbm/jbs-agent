/**
 * Login page — store owner enters their store password.
 *
 * Flow:
 *   1. Page loads → fetch store list from Worker
 *   2. User picks their store, enters password
 *   3. POST /api/auth/login → JWT → localStorage
 *   4. Redirect to /dashboard
 */
import { useEffect, useState } from "react";
import { Card, Select, Input, Button, Typography, Alert, Spin } from "antd";
import { ShopOutlined, LockOutlined } from "@ant-design/icons";
import { login, fetchStores, saveAuth, type StoreInfo } from "../api/auth";

export default function Login() {
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [storeId, setStoreId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    fetchStores()
      .then((list) => {
        setStores(list);
        if (list.length === 1) setStoreId(list[0].id);
      })
      .catch(() => setError("获取店铺列表失败，请稍后重试"))
      .finally(() => setInitLoading(false));
  }, []);

  const handleLogin = async () => {
    if (!storeId || !password) return;
    setError("");
    setLoading(true);
    try {
      const { token, store } = await login(password, storeId);
      saveAuth(token, store);
      window.location.hash = "#/dashboard";
    } catch (e: any) {
      setError(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: 24,
    }}>
      <Card style={{ width: 400, maxWidth: "100%", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Typography.Title level={3} style={{ marginBottom: 4 }}>
            剧本杀经营管家
          </Typography.Title>
          <Typography.Text type="secondary">请输入店铺密码查看经营数据</Typography.Text>
        </div>

        {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>选择店铺</Typography.Text>
            <Select
              value={storeId || undefined}
              onChange={setStoreId}
              placeholder="选择你的店铺"
              style={{ width: "100%" }}
              prefix={<ShopOutlined />}
              options={stores.map((s) => ({ value: s.id, label: `${s.name}（${s.city}）` }))}
            />
          </div>

          <div>
            <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>店铺密码</Typography.Text>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleLogin}
              placeholder="输入密码"
              prefix={<LockOutlined />}
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            onClick={handleLogin}
            loading={loading}
            disabled={!storeId || !password}
          >
            进入经营面板
          </Button>
        </div>
      </Card>
    </div>
  );
}
