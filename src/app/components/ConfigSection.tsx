import { Lock } from 'lucide-react';
import { Config } from '../types';

interface ConfigSectionProps {
  config: Config;
  setConfig: (config: Config) => void;
}

export default function ConfigSection({ config, setConfig }: ConfigSectionProps) {
  const updateConfig = (key: keyof Config, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem(key, value);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl mb-4">1. Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Anthropic API Key</label>
          <input
            type="password"
            placeholder="sk-ant-..."
            value={config.anthropicKey}
            onChange={(e) => updateConfig('anthropicKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Resend API Key</label>
          <input
            type="password"
            placeholder="re_..."
            value={config.resendKey}
            onChange={(e) => updateConfig('resendKey', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">From Email Address</label>
          <input
            type="email"
            placeholder="teacher@yourdomain.com"
            value={config.fromEmail}
            onChange={(e) => updateConfig('fromEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">Must be verified in Resend</p>
        </div>

        <div>
          <label className="block text-sm mb-1">Your Name</label>
          <input
            type="text"
            placeholder="Ms. Johnson"
            value={config.teacherName}
            onChange={(e) => updateConfig('teacherName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
          <Lock size={14} />
          <span>Keys are saved locally in your browser only</span>
        </div>
      </div>
    </section>
  );
}
