import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { TestPage01Page } from "../pages/TestPage01Page";
import { ErezTestTwoPage } from "../erez-test/ErezTestTwoPage";
import { PlatformArchitecturePage } from "../pages/PlatformArchitecturePage";

// Top-level app. AuthKitProvider + AuthGate in App.tsx gate this whole tree,
// so every route here assumes an authenticated user.
export const CRM = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/test-page-01" replace />} />
      <Route path="/test-page-01" element={<TestPage01Page />} />
      <Route path="/erez-test-two" element={<ErezTestTwoPage />} />
      <Route path="/platform-architecture" element={<PlatformArchitecturePage />} />
      <Route path="*" element={<Navigate to="/test-page-01" replace />} />
    </Routes>
  </Layout>
);
