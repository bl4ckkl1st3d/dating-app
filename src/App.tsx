import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom"; // Add Outlet
import { AuthProvider, useAuth } from "./context/AuthContext";
import HomePage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SignupProfile from "./pages/SignupProfile";
import Dashboard from "./pages/Dashboard";
import Dashboard2 from "./pages/Dashboard2";
import { FilterProvider } from "./context/FilterContext";
import Messages from "./pages/Messages";
import EditProfile from "./pages/EditProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout"; // <-- Import the new layout

// A layout for logged-out users (e.g., login, signup, home)
const LoggedOutLayout: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Logged-out routes */}
      <Route element={<LoggedOutLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Logged-in/Protected routes wrapped in the AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}> {/* <-- Wrap protected routes in AppLayout */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/signup-profile" element={<SignupProfile />} />
        </Route>
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
<AppRoutes />

        </FilterProvider>
        
      </AuthProvider>
    </Router>
  );
};

export default App;