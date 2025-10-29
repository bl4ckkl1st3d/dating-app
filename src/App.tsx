// src/App.tsx
import React, { useEffect } from "react"; // <-- Import useEffect
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"; // Add Outlet, useLocation
import { AuthProvider, useAuth } from "./context/AuthContext"; //
import HomePage from "./pages/Homepage"; //
import Login from "./pages/Login"; //
import Signup from "./pages/Signup"; //
import SignupProfile from "./pages/SignupProfile"; //
import Dashboard from "./pages/Dashboard"; //
// import Dashboard2 from "./pages/Dashboard2"; // Assuming Dashboard2 is not used
import { FilterProvider } from "./context/FilterContext"; //
import Messages from "./pages/Messages"; //
import EditProfile from "./pages/EditProfile"; //
import ProtectedRoute from "./components/ProtectedRoute"; //
import AppLayout from "./components/AppLayout"; //

// A layout for logged-out users (e.g., login, signup, home)
const LoggedOutLayout: React.FC = () => {
  // <-- Get isNewSignup flag and reset function
  const { user, loading, isNewSignup, resetNewSignupFlag } = useAuth(); //
  const location = useLocation();

  /* useEffect(() => {
    // If we are navigating *away* from signup-profile, reset the flag
    if (isNewSignup && location.pathname !== '/signup-profile') {
        console.log("Navigating away from signup-profile, resetting flag.");
        resetNewSignupFlag();
    }
  }, [location, isNewSignup, resetNewSignupFlag]); */


  if (loading) return <div className="h-screen w-full flex items-center justify-center">Loading...</div>; //

  // <-- Check isNewSignup FIRST
  if (isNewSignup && user && location.pathname !== '/signup-profile') {
     console.log("New signup detected, redirecting to /signup-profile");
     return <Navigate to="/signup-profile" replace />;
  }

  // If not a new signup but logged in, go to dashboard
  if (user && !isNewSignup) {
     return <Navigate to="/dashboard" replace />;
  }

  // Otherwise (not loading, not logged in OR isNewSignup but on the correct page), show the child routes
  return <Outlet />;
};

// --- AppRoutes remains the same ---
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
         {/* ADDED: Route specifically for signup-profile outside AppLayout if it shouldn't have the navbar */}
         <Route path="/signup-profile" element={<SignupProfile />} />

         {/* Routes with the main App Layout (Navbar etc.) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          {/* signup-profile is now outside this layout
          <Route path="/signup-profile" element={<SignupProfile />} /> */}
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