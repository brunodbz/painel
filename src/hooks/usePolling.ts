import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '../types';

// Função para buscar dados reais da API
const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch('/api/dashboard');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Se a API retornar dados no formato correto, use-os
    // Senão, retorne estrutura vazia
    return {
      elastic: result.elastic || [],
      defender: result.defender || [],
      opencti: result.opencti || [],
      tenable: result.tenable || [],
      rss: result.rss || [],
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Retornar estrutura vazia em caso de erro
    return {
      elastic: [],
      defender: [],
      opencti: [],
      tenable: [],
      rss: [],
    };
  }
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
