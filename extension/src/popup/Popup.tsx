import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  Sparkles,
  History,
  Eye,
  EyeOff,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ExtensionSettings, SubmissionHistoryItem, AIProvider } from '../types';

export const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [settings, setSettings] = useState<ExtensionSettings>({
    activeProvider: 'auto',
    geminiApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    dashboardUrl: 'http://localhost:3000',
    extensionToken: '',
    autoSync: true,
    preferredModel: 'auto'
  });
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [showKeys, setShowKeys] = useState<{ gemini?: boolean; openai?: boolean; claude?: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [testStatuses, setTestStatuses] = useState<Record<string, { loading: boolean; message: string; ok?: boolean }>>({});
  const [dashTestStatus, setDashTestStatus] = useState<{ loading: boolean; message: string; ok?: boolean } | null>(null);

  useEffect(() => {
    // Load stored settings
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
      if (res?.success && res.settings) {
        setSettings({
          activeProvider: res.settings.activeProvider || 'auto',
          geminiApiKey: res.settings.geminiApiKey || '',
          openaiApiKey: res.settings.openaiApiKey || '',
          anthropicApiKey: res.settings.anthropicApiKey || '',
          dashboardUrl: res.settings.dashboardUrl || 'http://localhost:3000',
          extensionToken: res.settings.extensionToken || '',
          autoSync: res.settings.autoSync !== false,
          preferredModel: res.settings.preferredModel || 'auto'
        });
      }
    });

    // Load recent history
    chrome.storage.local.get(['history'], (res) => {
      if (res?.history) {
        setHistory(res.history);
      }
    });
  }, []);

  const handleSave = () => {
    chrome.runtime.sendMessage({ type: 'SAVE_SETTINGS', payload: settings }, (res) => {
      if (res?.success) {
        setSaveStatus('Settings saved successfully!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    });
  };

  const handleTestProvider = (provider: 'gemini' | 'openai' | 'claude') => {
    const key = provider === 'gemini'
      ? settings.geminiApiKey
      : (provider === 'openai' ? settings.openaiApiKey : settings.anthropicApiKey);

    if (!key || !key.trim()) return;

    setTestStatuses(prev => ({
      ...prev,
      [provider]: { loading: true, message: `Pinging ${provider}...` }
    }));

    chrome.runtime.sendMessage(
      { type: 'TEST_PROVIDER_KEY', payload: { provider, apiKey: key } },
      (res) => {
        setTestStatuses(prev => ({
          ...prev,
          [provider]: {
            loading: false,
            ok: res?.success,
            message: res?.message || (res?.success ? 'Key is valid!' : 'Test failed')
          }
        }));
      }
    );
  };

  const handleTestDashboard = () => {
    setDashTestStatus({ loading: true, message: 'Pinging dashboard...' });
    chrome.runtime.sendMessage(
      {
        type: 'TEST_DASHBOARD',
        payload: { url: settings.dashboardUrl, token: settings.extensionToken }
      },
      (res) => {
        setDashTestStatus({
          loading: false,
          ok: res?.success,
          message: res?.message || (res?.success ? 'Connected!' : 'Connection failed')
        });
      }
    );
  };

  const toggleShowKey = (id: 'gemini' | 'openai' | 'claude') => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-[390px] bg-[#0d1117] text-[#c9d1d9] min-h-[520px] font-sans flex flex-col">
      {/* Top 2px Google 4-Color Accent Line */}
      <div className="h-[2px] w-full google-gradient-bar shrink-0" />

      {/* Top Header */}
      <div className="p-3.5 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20">
            <Sparkles className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
              AlgoPulse
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#21262d] text-[#4285F4] border border-[#30363d]">
                v1.2 Multi-AI
              </span>
            </h1>
            <p className="text-[11px] text-[#8b949e]">Gemini • OpenAI • Claude</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] shadow-sm'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] shadow-sm'
                : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            History ({history.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-4">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Active Provider Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#4285F4]" />
                Active AI Provider
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg text-[11px]">
                {(['auto', 'gemini', 'openai', 'claude'] as AIProvider[]).map((prov) => {
                  const isActive = settings.activeProvider === prov;
                  const label = prov === 'auto' ? '⚡ Auto' : prov === 'gemini' ? 'Gemini' : prov === 'openai' ? 'OpenAI' : 'Claude';
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSettings({ ...settings, activeProvider: prov })}
                      className={`py-1.5 px-1 rounded-md font-medium transition cursor-pointer text-center ${
                        isActive
                          ? 'bg-[#4285F4] text-white shadow-sm'
                          : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] text-[#8b949e] block">
                {settings.activeProvider === 'auto'
                  ? '⚡ Auto failover: Gemini (free) → OpenAI (gpt-4o-mini) → Claude'
                  : `Pinned to ${settings.activeProvider.toUpperCase()} with automatic backup failover.`}
              </span>
            </div>

            {/* Provider API Keys Card Container */}
            <div className="p-3 rounded-xl bg-[#161b22] border border-[#30363d] space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
                <span className="text-xs font-bold text-[#f0f6fc] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#FBBC05]" />
                  API Keys Configuration
                </span>
                <span className="text-[10px] text-[#8b949e]">Set any or all</span>
              </div>

              {/* 1. Google Gemini Key */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                    Google Gemini
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#34A853]/20 text-[#34A853] font-medium border border-[#34A853]/30">
                      Free Tier
                    </span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-0.5"
                  >
                    Get Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.gemini ? 'text' : 'password'}
                    value={settings.geminiApiKey}
                    onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                    placeholder="AIzaSy..."
                    className="w-full px-2.5 py-1.5 pr-8 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('gemini')}
                    className="absolute right-2 top-2 text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    {showKeys.gemini ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-[#8b949e]">Default: gemini-2.0-flash</span>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('gemini')}
                    disabled={!settings.geminiApiKey || testStatuses.gemini?.loading}
                    className="text-[10px] text-[#4285F4] hover:underline font-medium disabled:opacity-40 cursor-pointer"
                  >
                    {testStatuses.gemini?.loading ? 'Pinging...' : 'Test Key'}
                  </button>
                </div>
                {testStatuses.gemini && (
                  <div className={`p-1.5 rounded-lg text-[10px] flex items-center gap-1.5 ${
                    testStatuses.gemini.ok ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30' : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                  }`}>
                    {testStatuses.gemini.ok ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span>{testStatuses.gemini.message}</span>
                  </div>
                )}
              </div>

              {/* 2. OpenAI Key */}
              <div className="space-y-1 pt-1 border-t border-[#30363d]/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                    OpenAI
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#4285F4]/20 text-[#4285F4] font-medium border border-[#4285F4]/30">
                      gpt-4o-mini
                    </span>
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-0.5"
                  >
                    Get Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.openai ? 'text' : 'password'}
                    value={settings.openaiApiKey}
                    onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full px-2.5 py-1.5 pr-8 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('openai')}
                    className="absolute right-2 top-2 text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    {showKeys.openai ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-[#8b949e]">Default: gpt-4o-mini (ultra fast)</span>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('openai')}
                    disabled={!settings.openaiApiKey || testStatuses.openai?.loading}
                    className="text-[10px] text-[#4285F4] hover:underline font-medium disabled:opacity-40 cursor-pointer"
                  >
                    {testStatuses.openai?.loading ? 'Pinging...' : 'Test Key'}
                  </button>
                </div>
                {testStatuses.openai && (
                  <div className={`p-1.5 rounded-lg text-[10px] flex items-center gap-1.5 ${
                    testStatuses.openai.ok ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30' : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                  }`}>
                    {testStatuses.openai.ok ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span>{testStatuses.openai.message}</span>
                  </div>
                )}
              </div>

              {/* 3. Anthropic Claude Key */}
              <div className="space-y-1 pt-1 border-t border-[#30363d]/60">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                    Anthropic Claude
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#FBBC05]/20 text-[#FBBC05] font-medium border border-[#FBBC05]/30">
                      3.5 Haiku
                    </span>
                  </label>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-0.5"
                  >
                    Get Key <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showKeys.claude ? 'text' : 'password'}
                    value={settings.anthropicApiKey}
                    onChange={(e) => setSettings({ ...settings, anthropicApiKey: e.target.value })}
                    placeholder="sk-ant-..."
                    className="w-full px-2.5 py-1.5 pr-8 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('claude')}
                    className="absolute right-2 top-2 text-[#8b949e] hover:text-[#f0f6fc]"
                  >
                    {showKeys.claude ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[10px] text-[#8b949e]">Default: claude-3-5-haiku</span>
                  <button
                    type="button"
                    onClick={() => handleTestProvider('claude')}
                    disabled={!settings.anthropicApiKey || testStatuses.claude?.loading}
                    className="text-[10px] text-[#4285F4] hover:underline font-medium disabled:opacity-40 cursor-pointer"
                  >
                    {testStatuses.claude?.loading ? 'Pinging...' : 'Test Key'}
                  </button>
                </div>
                {testStatuses.claude && (
                  <div className={`p-1.5 rounded-lg text-[10px] flex items-center gap-1.5 ${
                    testStatuses.claude.ok ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30' : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                  }`}>
                    {testStatuses.claude.ok ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                    <span>{testStatuses.claude.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Model Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FBBC05]" />
                Model Override
              </label>
              <input
                type="text"
                value={settings.preferredModel || 'auto'}
                onChange={(e) => setSettings({ ...settings, preferredModel: e.target.value })}
                placeholder="auto (or gpt-4o, claude-3-5-sonnet, gemini-2.0-flash)"
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
              <span className="text-[10px] text-[#8b949e] block">
                Default: <code>auto</code> (uses optimal fast default model per provider)
              </span>
            </div>

            {/* Hosted Dashboard URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#4285F4]" />
                Hosted Dashboard URL
              </label>
              <input
                type="text"
                value={settings.dashboardUrl}
                onChange={(e) => setSettings({ ...settings, dashboardUrl: e.target.value })}
                placeholder="http://localhost:3000"
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
            </div>

            {/* Extension Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#4285F4]" />
                  Extension Access Token
                </label>
                <a
                  href={`${settings.dashboardUrl}/settings`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-0.5"
                >
                  Get Token <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={settings.extensionToken}
                onChange={(e) => setSettings({ ...settings, extensionToken: e.target.value })}
                placeholder="ap_sec_..."
                className="w-full px-3 py-2 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
              />
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-[#8b949e]">Synced to personal account</span>
                <button
                  type="button"
                  onClick={handleTestDashboard}
                  disabled={!settings.dashboardUrl || dashTestStatus?.loading}
                  className="text-[10px] text-[#4285F4] hover:underline font-medium disabled:opacity-40 cursor-pointer"
                >
                  {dashTestStatus?.loading ? 'Pinging...' : 'Test Sync'}
                </button>
              </div>
              {dashTestStatus && (
                <div
                  className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                    dashTestStatus.ok
                      ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                      : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                  }`}
                >
                  {dashTestStatus.ok ? (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{dashTestStatus.message}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 px-4 bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold rounded-lg shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save All Settings
              </button>
              {saveStatus && (
                <p className="text-center text-xs text-[#34A853] mt-2 font-medium">
                  {saveStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="py-12 text-center text-[#8b949e] space-y-2">
                <History className="w-8 h-8 mx-auto opacity-40 text-[#8b949e]" />
                <p className="text-xs">No reviews recorded yet.</p>
                <p className="text-[11px]">Solve a problem on LeetCode or GFG and click "Analyze Code"!</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#161b22] border border-[#30363d] rounded-lg text-xs space-y-1.5 hover:border-[#4285F4] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#f0f6fc] truncate max-w-[200px]">
                      {item.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.score >= 80
                          ? 'bg-[#34A853]/20 text-[#34A853]'
                          : item.score >= 60
                          ? 'bg-[#FBBC05]/20 text-[#FBBC05]'
                          : 'bg-[#EA4335]/20 text-[#EA4335]'
                      }`}
                    >
                      {item.score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8b949e]">
                    <span>{item.platform} • {item.language}</span>
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
