import { DashboardData, AlertItem } from '../types';
import { subMinutes } from 'date-fns';

const generateMockItem = (id: string, source: AlertItem['source'], severity: AlertItem['severity'], title: string): AlertItem => ({
  id,
  source,
  severity,
  title,
  timestamp: subMinutes(new Date(), Math.floor(Math.random() * 60)).toISOString(),
  description: "Detectada atividade anômala que requer investigação imediata."
});

export const MOCK_DATA: DashboardData = {
  elastic: [
    generateMockItem('e1', 'Elastic', 'critical', 'Tentativa de Brute Force SSH - Server A'),
    generateMockItem('e2', 'Elastic', 'high', 'Login falho múltiplo - Admin User'),
    generateMockItem('e3', 'Elastic', 'medium', 'Uso de CPU > 95% por 10min'),
    generateMockItem('e4', 'Elastic', 'low', 'Serviço reiniciado - Nginx'),
    generateMockItem('e5', 'Elastic', 'info', 'Backup diário concluído'),
  ],
  defender: [
    generateMockItem('d1', 'Defender', 'critical', 'Malware detectado: Trojan:Win32/Emotet'),
    generateMockItem('d2', 'Defender', 'high', 'Script suspeito PowerShell executado'),
    generateMockItem('d3', 'Defender', 'medium', 'Viagem impossível detectada (Login)'),
    generateMockItem('d4', 'Defender', 'low', 'Atualização de definições pendente'),
    generateMockItem('d5', 'Defender', 'info', 'Scan rápido finalizado'),
  ],
  opencti: [
    generateMockItem('o1', 'OpenCTI', 'critical', 'APT29 Campanha Ativa na Região'),
    generateMockItem('o2', 'OpenCTI', 'high', 'Nova variante Ransomware LockBit'),
    generateMockItem('o3', 'OpenCTI', 'medium', 'CVE-2024-1234 POC Publicada'),
    generateMockItem('o4', 'OpenCTI', 'medium', 'Indicador de Compromisso (IoC) atualizado'),
    generateMockItem('o5', 'OpenCTI', 'low', 'Relatório semanal de ameaças'),
  ],
  tenable: [
    generateMockItem('t1', 'Tenable', 'critical', 'Vulnerabilidade Log4j em SRV-DB-01'),
    generateMockItem('t2', 'Tenable', 'high', 'SSL/TLS: Certificado expirado'),
    generateMockItem('t3', 'Tenable', 'high', 'SMB Signing não habilitado'),
    generateMockItem('t4', 'Tenable', 'medium', 'Versão PHP desatualizada'),
    generateMockItem('t5', 'Tenable', 'low', 'Porta 80 aberta externamente'),
  ],
  rss: [
    generateMockItem('r1', 'RSS', 'info', 'The Hacker News: Nova falha Zero-Day no Chrome'),
    generateMockItem('r2', 'RSS', 'info', 'Krebs on Security: Vazamento de dados na Corp X'),
    generateMockItem('r3', 'RSS', 'info', 'BleepingComputer: Microsoft lança patch de emergência'),
    generateMockItem('r4', 'RSS', 'info', 'Dark Reading: Tendências de Phishing para 2025'),
    generateMockItem('r5', 'RSS', 'info', 'CISA: Alerta sobre infraestrutura crítica'),
  ]
};
