import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1280px)');
    const onChange = () => setCollapsed(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return (
    <div className={cn(
      "min-h-screen bg-slate-50 transition-all duration-300",
      collapsed ? "pl-20" : "pl-64"
    )}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <main className="p-4 md:p-6 xl:p-8 max-w-[1920px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
};
