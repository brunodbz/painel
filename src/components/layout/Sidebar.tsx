import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-indigo-500 rounded-lg text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-none">SOC View</h1>
          <span className="text-xs text-slate-500 font-medium">Security Dashboard</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Monitoramento</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings size={20} />
          <span className="font-medium">Configurações</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500 text-center">
          <p>v1.0.0 (Stable)</p>
          <p className="mt-1">Conectado: Seguro</p>
        </div>
      </div>
    </aside>
  );
};
