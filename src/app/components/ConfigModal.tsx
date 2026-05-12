import { X, Lock, Key } from 'lucide-react';
import { Config } from '../types';

interface ConfigModalProps {
  config: Config;
  setConfig: (config: Config) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigModal({ config, setConfig, isOpen, onClose }: ConfigModalProps) {
  const updateConfig = (key: keyof Config, value: string) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem(key, value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Key size={24} />
            <h2 className="text-xl">API Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="text-blue-600 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm text-blue-900">
                Your API keys are stored locally in your browser only. They are never sent to any server except the official APIs (Google Gemini and Resend).
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIza..."
                value={config.geminiKey}
                onChange={(e) => updateConfig('geminiKey', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Used for audio transcription and feedback generation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resend API Key
              </label>
              <input
                type="password"
                placeholder="re_..."
                value={config.resendKey}
                onChange={(e) => updateConfig('resendKey', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Used for sending feedback emails to students
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email Address
              </label>
              <input
                type="email"
                placeholder="teacher@yourdomain.com"
                value={config.fromEmail}
                onChange={(e) => updateConfig('fromEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Must be verified in your Resend account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Ms. Johnson"
                value={config.teacherName}
                onChange={(e) => updateConfig('teacherName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Appears in email signature
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
