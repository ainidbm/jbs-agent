import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import AppLayout from "./components/Layout";
import Login from "./pages/Login";

// Code-split pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Financials = lazy(() => import("./pages/Financials"));
const TrendPrediction = lazy(() => import("./pages/TrendPrediction"));
const ScriptAnalysis = lazy(() => import("./pages/ScriptAnalysis"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));

const PageFallback = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
    <Spin size="default" />
  </div>
);

// Simple route guard: redirect to login if no token
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("jbs_token");
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Suspense fallback={<PageFallback />}><Dashboard /></Suspense>} />
        <Route path="/financials" element={<Suspense fallback={<PageFallback />}><Financials /></Suspense>} />
        <Route path="/trend" element={<Suspense fallback={<PageFallback />}><TrendPrediction /></Suspense>} />
        <Route path="/scripts" element={<Suspense fallback={<PageFallback />}><ScriptAnalysis /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<PageFallback />}><Leaderboard /></Suspense>} />
      </Route>
    </Routes>
  );
}
