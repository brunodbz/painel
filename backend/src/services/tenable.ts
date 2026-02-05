import axios from 'axios';

interface TenableConfig {
  accessKey: string;
  secretKey: string;
}

interface TenableVulnerability {
  plugin_name: string;
  severity: number;
  host_name?: string;
  plugin_id: number;
  first_found?: string;
}

export class TenableService {
  private baseUrl = 'https://cloud.tenable.com';

  private getSeverityLevel(severity: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    if (severity >= 4) return 'critical';
    if (severity === 3) return 'high';
    if (severity === 2) return 'medium';
    if (severity === 1) return 'low';
    return 'info';
  }

  async getVulnerabilities(config: TenableConfig, limit: number = 10) {
    try {
      const response = await axios.get(`${this.baseUrl}/workbenches/vulnerabilities`, {
        headers: {
          'X-ApiKeys': `accessKey=${config.accessKey}; secretKey=${config.secretKey}`,
          'Content-Type': 'application/json',
        },
        params: {
          filter: 'severity:critical,high',
          limit: limit,
        },
      });

      const vulnerabilities = response.data.vulnerabilities || [];

      return vulnerabilities.slice(0, limit).map((vuln: TenableVulnerability) => ({
        id: `tenable-${vuln.plugin_id}`,
        source: 'Tenable' as const,
        severity: this.getSeverityLevel(vuln.severity),
        title: vuln.plugin_name || 'Vulnerabilidade Detectada',
        description: `Host: ${vuln.host_name || 'N/A'} | Plugin ID: ${vuln.plugin_id}`,
        timestamp: vuln.first_found || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar vulnerabilidades do Tenable:', error);
      return [];
    }
  }
}
