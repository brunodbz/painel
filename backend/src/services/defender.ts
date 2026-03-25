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
  private baseUrls = [
    'https://api.securitycenter.microsoft.com/api',
    'https://api.security.microsoft.com/api',
  ];
  private tokenUrl = 'https://login.microsoftonline.com';

  private async getAccessToken(config: DefenderConfig): Promise<string | null> {
    const tokenEndpoints = [
      {
        url: `${this.tokenUrl}/${config.tenantId}/oauth2/v2.0/token`,
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: 'https://api.securitycenter.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      },
      {
        url: `${this.tokenUrl}/${config.tenantId}/oauth2/v2.0/token`,
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: 'https://api.security.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      },
      {
        url: `${this.tokenUrl}/${config.tenantId}/oauth2/token`,
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          resource: 'https://api.securitycenter.microsoft.com',
          grant_type: 'client_credentials',
        }),
      },
    ];

    for (const tokenConfig of tokenEndpoints) {
      try {
        const response = await axios.post<TokenResponse>(tokenConfig.url, tokenConfig.body, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        if (response.data.access_token) {
          return response.data.access_token;
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          console.error('Erro ao obter token do Defender:', {
            tokenUrl: tokenConfig.url,
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          console.error('Erro ao obter token do Defender:', error instanceof Error ? error.message : error);
        }
      }
    }

    return null;
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
      let alerts: DefenderAlert[] = [];

      for (const baseUrl of this.baseUrls) {
        try {
          const response = await axios.get(`${baseUrl}/alerts`, {
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

          alerts = response.data.value || [];
          break;
        } catch (error: unknown) {
          if (axios.isAxiosError(error) && error.response) {
            console.error('Erro ao buscar alertas do Defender:', {
              baseUrl,
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            });
          } else {
            console.error('Erro ao buscar alertas do Defender:', error instanceof Error ? error.message : error);
          }
        }
      }

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
    } catch (error: unknown) {
      console.error('Erro inesperado no serviço Defender:', error instanceof Error ? error.message : error);
      return [];
    }
  }
}
