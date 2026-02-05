import axios from 'axios';

interface ElasticConfig {
  url: string;
  username: string;
  password: string;
  index?: string;
}

interface ElasticAlert {
  _id: string;
  _source: {
    '@timestamp': string;
    message?: string;
    event?: {
      severity?: number;
      action?: string;
      category?: string[];
    };
    rule?: {
      name?: string;
    };
    host?: {
      name?: string;
    };
  };
}

export class ElasticService {
  private getSeverityLevel(severity?: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    if (!severity) return 'medium';
    if (severity >= 90) return 'critical';
    if (severity >= 70) return 'high';
    if (severity >= 40) return 'medium';
    if (severity >= 20) return 'low';
    return 'info';
  }

  async getAlerts(config: ElasticConfig, limit: number = 10) {
    try {
      const index = config.index || 'logs-*';
      const auth = Buffer.from(`${config.username}:${config.password}`).toString('base64');

      // Query para buscar alertas recentes
      const response = await axios.post(
        `${config.url}/${index}/_search`,
        {
          size: limit * 2, // Buscar mais para filtrar depois
          sort: [{ '@timestamp': 'desc' }],
          query: {
            bool: {
              must: [
                {
                  range: {
                    '@timestamp': {
                      gte: 'now-7d', // Últimos 7 dias
                    },
                  },
                },
              ],
              should: [
                { match: { 'event.category': 'intrusion_detection' } },
                { match: { 'event.category': 'malware' } },
                { match: { 'event.action': 'blocked' } },
                { exists: { field: 'rule.name' } },
              ],
              minimum_should_match: 1,
            },
          },
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const hits = response.data.hits?.hits || [];

      return hits.slice(0, limit).map((hit: ElasticAlert) => ({
        id: `elastic-${hit._id}`,
        source: 'Elasticsearch' as const,
        severity: this.getSeverityLevel(hit._source.event?.severity),
        title: hit._source.rule?.name || hit._source.event?.action || 'Alerta de Segurança',
        description: `Host: ${hit._source.host?.name || 'N/A'} | ${hit._source.message || 'Evento de segurança detectado'}`,
        timestamp: hit._source['@timestamp'] || new Date().toISOString(),
      }));
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao buscar alertas do Elasticsearch:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.error('Erro ao buscar alertas do Elasticsearch:', error.message);
      }
      return [];
    }
  }
}
