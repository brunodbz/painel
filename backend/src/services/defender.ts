import axios from 'axios';

interface DefenderConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
}

interface DefenderAlert {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdDateTime: string;
  description?: string;
  machineId?: string;
  computerDnsName?: string;
  category?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

export class DefenderService {
  private baseUrl = 'https://api.securitycenter.microsoft.com/api';
  private tokenUrl = 'https://login.microsoftonline.com';

  private async getAccessToken(config: DefenderConfig): Promise<string | null> {
    try {
      const response = await axios.post<TokenResponse>(
        `${this.tokenUrl}/${config.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: 'https://api.securitycenter.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      console.error('Erro ao obter token do Defender:', error.message);
      return null;
    }
  }

  private getSeverityLevel(severity: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const sev = severity.toLowerCase();
    if (sev === 'high') return 'critical';
    if (sev === 'medium') return 'high';
    if (sev === 'low') return 'medium';
    return 'info';
  }

  async getAlerts(config: DefenderConfig, limit: number = 10) {
    try {
      const token = await this.getAccessToken(config);
      if (!token) {
        console.error('Não foi possível obter token do Defender');
        return [];
      }

      // Buscar alertas ativos dos últimos 7 dias
      const response = await axios.get(`${this.baseUrl}/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          $top: limit * 2, // Buscar mais para filtrar
          $filter: "status ne 'Resolved' and createdDateTime ge " + 
                   new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          $orderby: 'createdDateTime desc',
        },
      });

      const alerts = response.data.value || [];

      // Filtrar por severidade high e critical
      const filteredAlerts = alerts.filter((alert: DefenderAlert) => 
        alert.severity === 'High' || alert.severity === 'Medium'
      );

      return filteredAlerts.slice(0, limit).map((alert: DefenderAlert) => ({
        id: `defender-${alert.id}`,
        source: 'Microsoft Defender' as const,
        severity: this.getSeverityLevel(alert.severity),
        title: alert.title || 'Alerta de Segurança',
        description: `Host: ${alert.computerDnsName || 'N/A'} | ${alert.category || ''} | ${alert.description || alert.status}`,
        timestamp: alert.createdDateTime || new Date().toISOString(),
      }));
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao buscar alertas do Defender:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.error('Erro ao buscar alertas do Defender:', error.message);
      }
      return [];
    }
  }
}
