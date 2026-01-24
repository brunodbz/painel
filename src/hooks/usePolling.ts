import { useState, useEffect, useCallback } from 'react';
import { MOCK_DATA } from '../services/mockData';
import { DashboardData } from '../types';

// Em produção, isso chamaria sua API real
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simula delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Retorna dados mockados com timestamps atualizados para parecer "vivo"
  const now = new Date();
  const updateTimestamp = (items: any[]) => items.map(i => ({ ...i, timestamp: now.toISOString() }));
  
  return {
    elastic: updateTimestamp(MOCK_DATA.elastic),
    defender: updateTimestamp(MOCK_DATA.defender),
    opencti: updateTimestamp(MOCK_DATA.opencti),
    tenable: updateTimestamp(MOCK_DATA.tenable),
    rss: updateTimestamp(MOCK_DATA.rss),
  };
};

export function usePolling(intervalMs: number = 30000) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchDashboardData();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Falha ao atualizar dados');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, intervalMs);
    return () => clearInterval(interval);
  }, [fetchData, intervalMs]);

  return { data, loading, error, lastUpdated, refetch: fetchData };
}
