import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  return (
    <aside className={cn(
      "bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-800 z-50 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("flex items-center gap-3 border-b border-slate-800", collapsed ? "p-4 justify-center" : "p-6")}>
        <div className="p-2 bg-indigo-500 rounded-lg text-white">
          <ShieldCheck size={24} />
        </div>
        <div className={cn(collapsed && "hidden")}>
          <h1 className="font-bold text-white text-lg leading-none">SOC View</h1>
          <span className="text-xs text-slate-500 font-medium">Security Dashboard</span>
        </div>
      </div>

      <nav className={cn("flex-1 py-6 space-y-1", collapsed ? "px-2" : "px-3")}>
        <NavLink 
          to="/" 
          className={({ isActive }) => cn(
            "flex items-center rounded-lg transition-all duration-200",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <LayoutDashboard size={20} />
          <span className={cn("font-medium", collapsed && "hidden")}>Monitoramento</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => cn(
            "flex items-center rounded-lg transition-all duration-200",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
            isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings size={20} />
          <span className={cn("font-medium", collapsed && "hidden")}>Configurações</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          <span className={cn(!collapsed ? "inline" : "hidden")}>
            {collapsed ? 'Expandir' : 'Recolher'}
          </span>
        </button>

        <div className={cn("bg-slate-800/50 rounded-lg p-3 text-xs text-slate-500 text-center", collapsed && "hidden")}>
          <p>v1.0.0 (Stable)</p>
          <p className="mt-1">Conectado: Seguro</p>
        </div>
      </div>
    </aside>
  );
};
