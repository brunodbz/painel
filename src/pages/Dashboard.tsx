import React from 'react';
import { usePolling } from '../hooks/usePolling';
import { Card } from '../components/ui/Card';
import { SeverityBadge } from '../components/ui/SeverityBadge';
import { AlertItem } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, Database, Globe, Rss, Server, Shield } from 'lucide-react';

const AlertList = ({ items }: { items: AlertItem[] }) => (
  <ul className="divide-y divide-slate-100">
    {items.map((item) => (
      <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
        <div className="flex justify-between items-start mb-1">
          <span className="text-xs font-medium text-slate-400">
            {format(new Date(item.timestamp), "HH:mm:ss", { locale: ptBR })}
          </span>
          <SeverityBadge severity={item.severity} />
        </div>
        <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors">
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
        )}
      </li>
    ))}
  </ul>
);

export const Dashboard = () => {
  const { data, loading, lastUpdated } = usePolling(30000);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[80vh] flex-col gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Carregando feeds de segurança...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Visão Geral de Ameaças</h2>
          <p className="text-slate-500 mt-1">Monitoramento em tempo real de vetores de ataque e vulnerabilidades.</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Atualizado: {format(lastUpdated, "HH:mm:ss")}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Elastic Search - On Premise */}
        <Card 
          title="Elastic SIEM" 
          icon={<Database size={20} className="text-pink-600" />}
          className="xl:col-span-1 border-t-4 border-t-pink-500"
        >
          <AlertList items={data.elastic} />
        </Card>

        {/* Microsoft Defender */}
        <Card 
          title="Microsoft Defender 365" 
          icon={<Shield size={20} className="text-blue-600" />}
          className="xl:col-span-1 border-t-4 border-t-blue-500"
        >
          <AlertList items={data.defender} />
        </Card>

        {/* Tenable.io */}
        <Card 
          title="Tenable.io Vulnerabilities" 
          icon={<Activity size={20} className="text-amber-600" />}
          className="xl:col-span-1 border-t-4 border-t-amber-500"
        >
          <AlertList items={data.tenable} />
        </Card>

        {/* OpenCTI */}
        <Card 
          title="OpenCTI Intelligence" 
          icon={<Globe size={20} className="text-indigo-600" />}
          className="xl:col-span-2 border-t-4 border-t-indigo-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <AlertList items={data.opencti.slice(0, 3)} />
             <AlertList items={data.opencti.slice(3, 6)} />
          </div>
        </Card>

        {/* RSS Feeds */}
        <Card 
          title="Cyber Security News (RSS)" 
          icon={<Rss size={20} className="text-emerald-600" />}
          className="xl:col-span-1 border-t-4 border-t-emerald-500"
        >
          <AlertList items={data.rss} />
        </Card>
      </div>
    </div>
  );
};
