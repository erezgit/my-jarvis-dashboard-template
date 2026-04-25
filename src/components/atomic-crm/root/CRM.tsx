import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../layout/Layout";
import { WelcomePage } from "../pages/WelcomePage";

// Top-level app. AuthKitProvider + AuthGate in App.tsx gate this whole tree,
// so every route here assumes an authenticated user.
//
// Template default: every fresh tenant starts with just the WelcomePage at /.
// Pages added by the tenant's assistant land here, one route per page.
export const CRM = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);
