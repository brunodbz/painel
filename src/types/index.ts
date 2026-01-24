export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AlertItem {
  id: string;
  title: string;
  source: 'Elastic' | 'Defender' | 'OpenCTI' | 'Tenable' | 'RSS';
  severity: Severity;
  timestamp: string;
  description?: string;
}

export interface DashboardData {
  elastic: AlertItem[];
  defender: AlertItem[];
  opencti: AlertItem[];
  tenable: AlertItem[];
  rss: AlertItem[];
}

export interface ServiceConfig {
  url: string;
  apiKey: string;
  enabled: boolean;
}

export interface AppConfig {
  elastic: ServiceConfig;
  defender: ServiceConfig;
  opencti: ServiceConfig;
  tenable: ServiceConfig;
  rss: { urls: string[] };
}
