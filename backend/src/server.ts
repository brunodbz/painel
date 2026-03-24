import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Pool } from 'pg';

type ElasticSettings = {
  url?: string;
  apiKey?: string;
  username?: string;
  password?: string;
};

type DefenderSettings = {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
};

type OpenCTISettings = {
  url?: string;
  apiKey?: string;
  token?: string;
};

type TenableSettings = {
  accessKey?: string;
  secretKey?: string;
};

type RSSSettings = {
  feeds?: string[];
};

type AppSettings = {
  elastic?: ElasticSettings;
  defender?: DefenderSettings;
  opencti?: OpenCTISettings;
  tenable?: TenableSettings;
  rss?: RSSSettings;
};

type DashboardData = {
  elastic: unknown[];
  defender: unknown[];
  opencti: unknown[];
  tenable: unknown[];
  rss: unknown[];
};
import { TenableService } from './services/tenable';
import { ElasticService } from './services/elastic';
import { DefenderService } from './services/defender';
import { OpenCTIService } from './services/opencti';
import { RSSService } from './services/rss';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(helmet());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

async function testDatabaseConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully');
    await initializeDatabase();
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

async function initializeDatabase() {
  try {
    // Criar tabela de configurações se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_settings (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(50) UNIQUE NOT NULL,
        config_data JSONB NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de auditoria
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings_audit_log (
        id SERIAL PRIMARY KEY,
        service_name VARCHAR(50) NOT NULL,
        action VARCHAR(20) NOT NULL,
        changed_by VARCHAR(100),
        old_data JSONB,
        new_data JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✓ Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      timestamp: new Date(),
      database: 'connected' 
    });
  } catch {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date(),
      database: 'disconnected' 
    });
  }
});

// Dashboard data
app.get('/api/dashboard', async (req, res) => {
  try {
    // Buscar configurações ativas do banco
    const result = await pool.query(`
      SELECT service_name, config_data
      FROM api_settings
      WHERE is_active = true
    `);

    const settings: AppSettings = {};
    result.rows.forEach(row => {
      settings[row.service_name as keyof AppSettings] = row.config_data;
    });

    // Inicializar dados vazios
    const dashboardData: DashboardData = {
      elastic: [],
      defender: [],
      opencti: [],
      tenable: [],
      rss: []
    };

    // Buscar dados de todas as APIs em paralelo
    const promises = [];

    // Elasticsearch
    if (settings.elastic?.url && (settings.elastic.apiKey || (settings.elastic.username && settings.elastic.password))) {
      const elasticSettings = settings.elastic;
      promises.push(
        (async () => {
          try {
            const elasticService = new ElasticService();
            const config = elasticSettings.apiKey
              ? { ...elasticSettings, username: '', password: elasticSettings.apiKey }
              : elasticSettings;
            dashboardData.elastic = await elasticService.getAlerts({
              url: config.url || '',
              username: config.username || '',
              password: config.password || '',
            }, 10);
            console.log(`✓ Fetched ${dashboardData.elastic.length} alerts from Elasticsearch`);
          } catch (error) {
            console.error('Error fetching Elasticsearch data:', error);
            dashboardData.elastic = [];
          }
        })()
      );
    }

    // Microsoft Defender
    if (settings.defender?.tenantId && settings.defender.clientId && settings.defender.clientSecret) {
      const defenderSettings = settings.defender;
      promises.push(
        (async () => {
          try {
            const defenderService = new DefenderService();
            dashboardData.defender = await defenderService.getAlerts({
              tenantId: defenderSettings.tenantId || '',
              clientId: defenderSettings.clientId || '',
              clientSecret: defenderSettings.clientSecret || '',
            }, 10);
            console.log(`✓ Fetched ${dashboardData.defender.length} alerts from Microsoft Defender`);
          } catch (error) {
            console.error('Error fetching Defender data:', error);
            dashboardData.defender = [];
          }
        })()
      );
    }

    // OpenCTI
    if (settings.opencti?.url && (settings.opencti.apiKey || settings.opencti.token)) {
      const openCtiSettings = settings.opencti;
      promises.push(
        (async () => {
          try {
            const openctiService = new OpenCTIService();
            const apiKey = openCtiSettings.apiKey || openCtiSettings.token || '';
            dashboardData.opencti = await openctiService.getThreats({ 
              url: openCtiSettings.url || '', 
              apiKey
            }, 10);
            console.log(`✓ Fetched ${dashboardData.opencti.length} threats from OpenCTI`);
          } catch (error) {
            console.error('Error fetching OpenCTI data:', error);
            dashboardData.opencti = [];
          }
        })()
      );
    }

    // Tenable
    if (settings.tenable?.accessKey && settings.tenable.secretKey) {
      const tenableSettings = settings.tenable;
      promises.push(
        (async () => {
          try {
            const tenableService = new TenableService();
            dashboardData.tenable = await tenableService.getVulnerabilities({
              accessKey: tenableSettings.accessKey || '',
              secretKey: tenableSettings.secretKey || ''
            }, 10);
            console.log(`✓ Fetched ${dashboardData.tenable.length} vulnerabilities from Tenable`);
          } catch (error) {
            console.error('Error fetching Tenable data:', error);
            dashboardData.tenable = [];
          }
        })()
      );
    }

    // RSS Feeds
    if (settings.rss?.feeds && Array.isArray(settings.rss.feeds) && settings.rss.feeds.length > 0) {
      const rssSettings = settings.rss;
      promises.push(
        (async () => {
          try {
            const rssService = new RSSService();
            dashboardData.rss = await rssService.getNews({ feeds: rssSettings.feeds || [] }, 10);
            console.log(`✓ Fetched ${dashboardData.rss.length} news from RSS feeds`);
          } catch (error) {
            console.error('Error fetching RSS data:', error);
            dashboardData.rss = [];
          }
        })()
      );
    }

    // Aguardar todas as requisições
    await Promise.all(promises);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Salvar configurações
app.post('/api/settings', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const {
      elasticUrl,
      elasticKey,
      defenderTenantId,
      defenderClientId,
      defenderSecret,
      openCtiUrl,
      openCtiToken,
      tenableAccessKey,
      tenableSecretKey,
      rssFeeds
    } = req.body;

    // Salvar Elastic
    if (elasticUrl && elasticKey) {
      const elasticConfig = JSON.stringify({ url: elasticUrl, apiKey: elasticKey });
      await client.query(`
        INSERT INTO api_settings (service_name, config_data)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (service_name) 
        DO UPDATE SET config_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      `, ['elastic', elasticConfig]);
    }

    // Salvar Defender
    if (defenderTenantId && defenderClientId && defenderSecret) {
      const defenderConfig = JSON.stringify({
        tenantId: defenderTenantId,
        clientId: defenderClientId,
        clientSecret: defenderSecret,
      });
      await client.query(`
        INSERT INTO api_settings (service_name, config_data)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (service_name) 
        DO UPDATE SET config_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      `, ['defender', defenderConfig]);
    }

    // Salvar OpenCTI
    if (openCtiUrl && openCtiToken) {
      const openCtiConfig = JSON.stringify({ url: openCtiUrl, token: openCtiToken });
      await client.query(`
        INSERT INTO api_settings (service_name, config_data)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (service_name) 
        DO UPDATE SET config_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      `, ['opencti', openCtiConfig]);
    }

    // Salvar Tenable
    if (tenableAccessKey && tenableSecretKey) {
      const tenableConfig = JSON.stringify({ accessKey: tenableAccessKey, secretKey: tenableSecretKey });
      await client.query(`
        INSERT INTO api_settings (service_name, config_data)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (service_name) 
        DO UPDATE SET config_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      `, ['tenable', tenableConfig]);
    }

    // Salvar RSS Feeds
    if (rssFeeds) {
      const feedsArray = rssFeeds.split('\n').filter((f: string) => f.trim());
      const rssConfig = JSON.stringify({ feeds: feedsArray });
      await client.query(`
        INSERT INTO api_settings (service_name, config_data)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (service_name) 
        DO UPDATE SET config_data = $2::jsonb, updated_at = CURRENT_TIMESTAMP
      `, ['rss', rssConfig]);
    }

    // Log de auditoria
    const auditPayload = JSON.stringify(req.body ?? {});
    await client.query(`
      INSERT INTO settings_audit_log (service_name, action, new_data)
      VALUES ($1, $2, $3::jsonb)
    `, ['all', 'UPDATE', auditPayload]);

    await client.query('COMMIT');
    
    res.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso!',
      timestamp: new Date()
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao salvar configurações' 
    });
  } finally {
    client.release();
  }
});

// Buscar configurações
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT service_name, config_data, is_active, updated_at
      FROM api_settings
      WHERE is_active = true
    `);

    const settings: Record<string, Record<string, unknown> | null> = {
      elastic: null,
      defender: null,
      opencti: null,
      tenable: null,
      rss: null
    };

    result.rows.forEach(row => {
      settings[row.service_name] = {
        ...row.config_data,
        updatedAt: row.updated_at
      };
    });

    res.json({ 
      success: true, 
      data: settings,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar configurações' 
    });
  }
});

// Buscar configuração por serviço
app.get('/api/settings/:service', async (req, res) => {
  try {
    const { service } = req.params;
    
    const result = await pool.query(`
      SELECT config_data, is_active, updated_at
      FROM api_settings
      WHERE service_name = $1 AND is_active = true
    `, [service]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Configuração não encontrada' 
      });
    }

    res.json({ 
      success: true, 
      data: result.rows[0].config_data,
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Error fetching service settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar configuração do serviço' 
    });
  }
});

// Deletar configuração de um serviço
app.delete('/api/settings/:service', async (req, res) => {
  try {
    const { service } = req.params;
    
    await pool.query(`
      UPDATE api_settings 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE service_name = $1
    `, [service]);

    // Log de auditoria
    await pool.query(`
      INSERT INTO settings_audit_log (service_name, action)
      VALUES ($1, $2)
    `, [service, 'DELETE']);

    res.json({ 
      success: true, 
      message: 'Configuração removida com sucesso' 
    });
  } catch (error) {
    console.error('Error deleting settings:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao remover configuração' 
    });
  }
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  void next;
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

testDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
