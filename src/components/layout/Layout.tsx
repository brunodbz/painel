import React from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 pl-64">
      <Sidebar />
      <main className="p-8 max-w-[1920px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
