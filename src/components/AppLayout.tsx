import React from 'react';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

const AppLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* FIX: The Navbar and Main content are now explicitly ordered.
        On mobile: main = order-1, nav = order-2 (but fixed to bottom)
        On desktop: nav = md:order-1, main = md:order-2
      */}
      <AppNavbar />
      <main className="order-1 md:order-2 flex-1 overflow-y-auto pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;