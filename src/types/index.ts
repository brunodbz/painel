export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AlertItem {
  id: string;
  title: string;
  source: 'Defender' | 'Tenable' | 'RSS';
  severity: Severity;
  timestamp: string;
  description?: string;
}

export interface DashboardData {
  defender: AlertItem[];
  tenable: AlertItem[];
  rss: AlertItem[];
}

export interface ServiceConfig {
  url: string;
  apiKey: string;
  enabled: boolean;
}

export interface AppConfig {
  defender: ServiceConfig;
  tenable: ServiceConfig;
  rss: { urls: string[] };
}
