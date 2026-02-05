import axios from 'axios';

interface OpenCTIConfig {
  url: string;
  apiKey: string;
}

interface OpenCTIIndicator {
  id: string;
  name: string;
  pattern?: string;
  pattern_type?: string;
  created: string;
  modified?: string;
  confidence?: number;
  x_opencti_score?: number;
  description?: string;
  labels?: Array<{ value: string }>;
  indicator_types?: string[];
}

export class OpenCTIService {
  private getSeverityFromScore(score?: number, confidence?: number): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const effectiveScore = score || confidence || 50;
    
    if (effectiveScore >= 80) return 'critical';
    if (effectiveScore >= 60) return 'high';
    if (effectiveScore >= 40) return 'medium';
    if (effectiveScore >= 20) return 'low';
    return 'info';
  }

  async getThreats(config: OpenCTIConfig, limit: number = 10) {
    try {
      // Query GraphQL para buscar indicadores recentes
      const query = `
        query GetIndicators($first: Int!) {
          indicators(
            first: $first,
            orderBy: created,
            orderMode: desc,
            filters: {
              mode: and,
              filters: [
                {
                  key: "indicator_types",
                  values: ["malicious-activity", "anomalous-activity"],
                  operator: eq,
                  mode: or
                }
              ],
              filterGroups: []
            }
          ) {
            edges {
              node {
                id
                name
                pattern
                pattern_type
                created
                modified
                confidence
                x_opencti_score
                description
                labels {
                  edges {
                    node {
                      value
                    }
                  }
                }
                indicator_types
              }
            }
          }
        }
      `;

      const response = await axios.post(
        `${config.url}/graphql`,
        {
          query,
          variables: { first: limit * 2 },
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const edges = response.data.data?.indicators?.edges || [];
      
      // Filtrar por score/confidence alto
      const filteredIndicators = edges
        .map((edge: any) => edge.node as OpenCTIIndicator)
        .filter((indicator: OpenCTIIndicator) => 
          (indicator.x_opencti_score || 0) >= 50 || (indicator.confidence || 0) >= 50
        );

      return filteredIndicators.slice(0, limit).map((indicator: OpenCTIIndicator) => {
        const labels = indicator.labels?.map(l => l.value).join(', ') || '';
        const types = indicator.indicator_types?.join(', ') || 'unknown';
        
        return {
          id: `opencti-${indicator.id}`,
          source: 'OpenCTI' as const,
          severity: this.getSeverityFromScore(indicator.x_opencti_score, indicator.confidence),
          title: indicator.name || 'Indicador de Ameaça',
          description: `Type: ${types} | Pattern: ${indicator.pattern_type || 'N/A'} | ${labels ? 'Labels: ' + labels : ''}`,
          timestamp: indicator.modified || indicator.created || new Date().toISOString(),
        };
      });
    } catch (error: any) {
      if (error.response) {
        console.error('Erro ao buscar ameaças do OpenCTI:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.error('Erro ao buscar ameaças do OpenCTI:', error.message);
      }
      return [];
    }
  }
}
