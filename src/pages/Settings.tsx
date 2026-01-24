import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../components/ui/Card';
import { Server, Key, Save } from 'lucide-react';

type SettingsFormValues = {
  elasticUrl: string;
  elasticKey: string;
  defenderTenantId: string;
  defenderClientId: string;
  defenderSecret: string;
  openCtiUrl: string;
  openCtiToken: string;
  tenableAccessKey: string;
  tenableSecretKey: string;
  rssFeeds: string;
};

export const Settings = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>();

  const onSubmit = async (data: SettingsFormValues) => {
    console.log("Saving settings:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert("Configurações salvas com sucesso! (Simulação)");
  };

  const InputGroup = ({ label, name, type = "text", placeholder, error }: any) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          {...register(name, { required: true })}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {error && <span className="text-xs text-rose-500 absolute -bottom-5 left-0">Campo obrigatório</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Painel de Controle</h2>
        <p className="text-slate-500 mt-1">Gerencie conexões de API e fontes de dados.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Elastic Configuration */}
        <Card title="Elastic Search (On-Premise)" icon={<Server size={20} />} className="overflow-visible">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="URL do Cluster" name="elasticUrl" placeholder="https://elastic.internal:9200" error={errors.elasticUrl} />
            <InputGroup label="API Key" name="elasticKey" type="password" placeholder="••••••••••••" error={errors.elasticKey} />
          </div>
        </Card>

        {/* Defender Configuration */}
        <Card title="Microsoft Defender 365" icon={<Key size={20} />} className="overflow-visible">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputGroup label="Tenant ID" name="defenderTenantId" placeholder="Azure Tenant ID" error={errors.defenderTenantId} />
            <InputGroup label="Client ID" name="defenderClientId" placeholder="App Client ID" error={errors.defenderClientId} />
            <InputGroup label="Client Secret" name="defenderSecret" type="password" placeholder="••••••••••••" error={errors.defenderSecret} />
          </div>
        </Card>

        {/* OpenCTI & Tenable */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="OpenCTI" icon={<Server size={20} />} className="overflow-visible">
            <div className="p-6 space-y-4">
              <InputGroup label="URL da Plataforma" name="openCtiUrl" placeholder="https://opencti.local" error={errors.openCtiUrl} />
              <InputGroup label="Auth Token" name="openCtiToken" type="password" placeholder="Bearer Token" error={errors.openCtiToken} />
            </div>
          </Card>

          <Card title="Tenable.io" icon={<Server size={20} />} className="overflow-visible">
            <div className="p-6 space-y-4">
              <InputGroup label="Access Key" name="tenableAccessKey" placeholder="Tenable Access Key" error={errors.tenableAccessKey} />
              <InputGroup label="Secret Key" name="tenableSecretKey" type="password" placeholder="Tenable Secret Key" error={errors.tenableSecretKey} />
            </div>
          </Card>
        </div>

        {/* RSS Feeds */}
        <Card title="Feeds RSS" icon={<Server size={20} />} className="overflow-visible">
          <div className="p-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">URLs dos Feeds (um por linha)</label>
            <textarea
              {...register("rssFeeds")}
              rows={4}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="https://feeds.feedburner.com/TheHackersNews&#10;https://krebsonsecurity.com/feed/"
            ></textarea>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-70"
          >
            <Save size={20} />
            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </div>
  );
};
