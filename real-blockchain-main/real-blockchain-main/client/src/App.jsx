import { BrowserRouter, Route, Routes } from "react-router-dom";
import BlockchainDashboardPage from "./pages/BlockchainDashboardPage.jsx";
import NavBar from "./components/NavBar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(251,146,60,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_40%)]" />
          <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
            <NavBar />
            <main className="flex-1 py-8 sm:py-12">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/blockchain-dashboard"
                  element={
                    <ProtectedRoute>
                      <BlockchainDashboardPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
