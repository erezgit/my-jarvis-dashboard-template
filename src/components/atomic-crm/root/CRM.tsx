import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { WelcomePage } from "../pages/WelcomePage";
import { InstallMcpPage } from "../pages/InstallMcpPage";
import { MeetingsPage } from "../pages/MeetingsPage";
import { MeetingDetailPage } from "../pages/MeetingDetailPage";

// Top-level app. AuthKitProvider + AuthGate in App.tsx gate this whole tree,
// so every route here assumes an authenticated user.
//
// Template default: every fresh tenant starts with the WelcomePage at /
// and the InstallMcpPage at /install-mcp. Pages added by the tenant's
// assistant land here, one route per page.
export const CRM = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/install-mcp" element={<InstallMcpPage />} />
      <Route path="/meetings" element={<MeetingsPage />} />
      <Route path="/meetings/:id" element={<MeetingDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);
