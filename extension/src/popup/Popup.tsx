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
  EyeOff
} from 'lucide-react';
import { ExtensionSettings, SubmissionHistoryItem } from '../types';

export const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');
  const [settings, setSettings] = useState<ExtensionSettings>({
    geminiApiKey: '',
    dashboardUrl: 'http://localhost:3000',
    extensionToken: '',
    autoSync: true
  });
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [keyTestStatus, setKeyTestStatus] = useState<{ loading: boolean; message: string; ok?: boolean } | null>(null);
  const [dashTestStatus, setDashTestStatus] = useState<{ loading: boolean; message: string; ok?: boolean } | null>(null);

  useEffect(() => {
    // Load stored settings
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (res) => {
      if (res?.success && res.settings) {
        setSettings(res.settings);
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

  const handleTestKey = () => {
    setKeyTestStatus({ loading: true, message: 'Testing Gemini API key...' });
    chrome.runtime.sendMessage(
      { type: 'TEST_GEMINI_KEY', payload: { apiKey: settings.geminiApiKey } },
      (res) => {
        setKeyTestStatus({
          loading: false,
          ok: res?.success,
          message: res?.message || (res?.success ? 'Key is valid!' : 'Test failed')
        });
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

  return (
    <div className="w-[380px] bg-[#0d1117] text-[#c9d1d9] min-h-[480px] font-sans flex flex-col">
      {/* Top 2px Google 4-Color Accent Line */}
      <div className="h-[2px] w-full google-gradient-bar shrink-0" />

      {/* Top Header */}
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#4285F4] text-white shadow-md shadow-[#4285F4]/20">
            <Sparkles className="w-4 h-4 text-[#FBBC05] fill-[#FBBC05]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-[#f0f6fc] flex items-center gap-1.5">
              AlgoPulse
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#21262d] text-[#4285F4] border border-[#30363d]">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-[#8b949e]">AI Code Review & Tracker</p>
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
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Gemini API Key Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#f0f6fc] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#4285F4]" />
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#4285F4] hover:underline flex items-center gap-0.5"
                >
                  Get Free Key <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 pr-9 bg-[#161b22] border border-[#30363d] rounded-lg text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#4285F4] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-[#8b949e] hover:text-[#f0f6fc]"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-[#8b949e]">Uses free Google Gemini Flash tier</span>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={!settings.geminiApiKey || keyTestStatus?.loading}
                  className="text-[10px] text-[#4285F4] hover:text-[#3367D6] font-medium disabled:opacity-40 cursor-pointer"
                >
                  {keyTestStatus?.loading ? 'Testing...' : 'Test Key'}
                </button>
              </div>
              {keyTestStatus && (
                <div
                  className={`p-2 rounded-lg text-[11px] flex items-center gap-1.5 ${
                    keyTestStatus.ok
                      ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                      : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                  }`}
                >
                  {keyTestStatus.ok ? (
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{keyTestStatus.message}</span>
                </div>
              )}
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
              <span className="text-[10px] text-[#8b949e] block">
                Local dev or deployed URL (e.g. http://localhost:3000)
              </span>
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
                <span className="text-[10px] text-[#8b949e]">Generated from dashboard settings</span>
                <button
                  type="button"
                  onClick={handleTestDashboard}
                  disabled={!settings.dashboardUrl || dashTestStatus?.loading}
                  className="text-[10px] text-[#4285F4] hover:text-[#3367D6] font-medium disabled:opacity-40 cursor-pointer"
                >
                  {dashTestStatus?.loading ? 'Pinging...' : 'Test Connection'}
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

            {/* Auto-Sync Toggle */}
            <div className="p-3 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#f0f6fc]">Auto-Sync Submissions</p>
                <p className="text-[10px] text-[#8b949e]">Automatically push evaluated code to dashboard</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                className="w-4 h-4 accent-[#4285F4] rounded cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2 bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium text-xs rounded-lg transition shadow-sm shadow-[#4285F4]/30 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
              {saveStatus && (
                <p className="text-[11px] text-[#34A853] text-center mt-2 font-medium">
                  {saveStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="py-12 text-center text-[#8b949e] text-xs space-y-2">
                <History className="w-8 h-8 mx-auto text-[#6e7681]" />
                <p className="text-[#f0f6fc] font-medium">No evaluations recorded yet.</p>
                <p className="text-[10px] text-[#8b949e]">Open LeetCode, write code, and click "Analyze Code" to see entries here.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-xs space-y-1 hover:border-[#8b949e]/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#f0f6fc] truncate max-w-[200px]">
                      {item.problem_title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.overall_score >= 80
                          ? 'bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30'
                          : item.overall_score >= 60
                          ? 'bg-[#FBBC05]/15 text-[#FBBC05] border border-[#FBBC05]/30'
                          : 'bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30'
                      }`}
                    >
                      {item.overall_score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8b949e]">
                    <span className="font-mono">Time: {item.user_time_complexity}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}

            {history.length > 0 && settings.dashboardUrl && (
              <div className="pt-2">
                <a
                  href={settings.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] font-medium text-xs rounded-lg border border-[#30363d] transition flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <span>View All in Web Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#30363d] text-center text-[10px] text-[#8b949e] bg-[#161b22]">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]" />
          <span>Ready for LeetCode evaluation</span>
        </div>
      </div>
    </div>
  );
};
