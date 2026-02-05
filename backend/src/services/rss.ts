import Parser from 'rss-parser';

interface RSSConfig {
  feeds: string[]; // Array de URLs de feeds RSS
}

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  categories?: string[];
  creator?: string;
}

export class RSSService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'SOC-Dashboard/1.0',
      },
    });
  }

  private getSeverityFromKeywords(title: string, content: string): 'critical' | 'high' | 'medium' | 'low' | 'info' {
    const text = (title + ' ' + content).toLowerCase();
    
    // Palavras-chave críticas
    const criticalKeywords = ['zero-day', '0-day', 'ransomware', 'breach', 'exploit', 'rce', 'remote code execution'];
    const highKeywords = ['vulnerability', 'cve-', 'malware', 'attack', 'threat', 'security alert'];
    const mediumKeywords = ['security', 'patch', 'update', 'advisory', 'warning'];
    
    if (criticalKeywords.some(kw => text.includes(kw))) return 'critical';
    if (highKeywords.some(kw => text.includes(kw))) return 'high';
    if (mediumKeywords.some(kw => text.includes(kw))) return 'medium';
    
    return 'info';
  }

  async getNews(config: RSSConfig, limit: number = 10) {
    try {
      const allNews: any[] = [];

      // Buscar de todos os feeds em paralelo
      const feedPromises = config.feeds.map(async (feedUrl) => {
        try {
          const feed = await this.parser.parseURL(feedUrl);
          return feed.items || [];
        } catch (error) {
          console.error(`Erro ao buscar feed ${feedUrl}:`, error);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      
      // Combinar todos os resultados
      results.forEach(items => allNews.push(...items));

      // Ordenar por data (mais recentes primeiro)
      allNews.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
      });

      // Filtrar apenas notícias relacionadas a segurança
      const securityNews = allNews.filter((item: RSSItem) => {
        const title = item.title?.toLowerCase() || '';
        const content = item.contentSnippet?.toLowerCase() || '';
        const categories = item.categories?.join(' ').toLowerCase() || '';
        
        const securityKeywords = [
          'security', 'vulnerability', 'exploit', 'malware', 'ransomware',
          'threat', 'attack', 'breach', 'cve', 'patch', 'advisory',
          'segurança', 'vulnerabilidade', 'ameaça', 'ataque'
        ];
        
        return securityKeywords.some(kw => 
          title.includes(kw) || content.includes(kw) || categories.includes(kw)
        );
      });

      return securityNews.slice(0, limit).map((item: RSSItem, index: number) => {
        const title = item.title || 'Notícia de Segurança';
        const content = item.contentSnippet || item.content || '';
        
        return {
          id: `rss-${Date.now()}-${index}`,
          source: 'RSS Feed' as const,
          severity: this.getSeverityFromKeywords(title, content),
          title: title,
          description: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          timestamp: item.pubDate || new Date().toISOString(),
          link: item.link,
        };
      });
    } catch (error: any) {
      console.error('Erro ao buscar notícias RSS:', error.message);
      return [];
    }
  }
}
