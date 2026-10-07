import React, { useState, useEffect } from 'react';
import {
  Key,
  Globe,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Save,
  RotateCcw,
  Sparkles,
  History,
  Lock,
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
    <div className="w-[380px] bg-slate-900 text-slate-100 min-h-[480px] font-sans flex flex-col">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              AlgoPulse
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">AI Code Review & Tracker</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-800/80 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
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
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  Gemini API Key
                </label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
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
                  className="w-full px-3 py-2 pr-9 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-slate-400">Uses 100% free Gemini 2.5 Flash tier</span>
                <button
                  type="button"
                  onClick={handleTestKey}
                  disabled={!settings.geminiApiKey || keyTestStatus?.loading}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-40"
                >
                  {keyTestStatus?.loading ? 'Testing...' : 'Test Key'}
                </button>
              </div>
              {keyTestStatus && (
                <div
                  className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
                    keyTestStatus.ok
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/50 text-rose-300 border border-rose-800'
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
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                Hosted Dashboard URL
              </label>
              <input
                type="text"
                value={settings.dashboardUrl}
                onChange={(e) => setSettings({ ...settings, dashboardUrl: e.target.value })}
                placeholder="http://localhost:3000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <span className="text-[10px] text-slate-400 block">
                Local dev or deployed URL (e.g. https://your-algopulse.vercel.app)
              </span>
            </div>

            {/* Extension Access Token */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Extension Access Token
                </label>
                <a
                  href={`${settings.dashboardUrl}/settings`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Get Token <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <input
                type="text"
                value={settings.extensionToken}
                onChange={(e) => setSettings({ ...settings, extensionToken: e.target.value })}
                placeholder="ap_sec_..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[10px] text-slate-400">Generated from dashboard settings</span>
                <button
                  type="button"
                  onClick={handleTestDashboard}
                  disabled={!settings.dashboardUrl || dashTestStatus?.loading}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-40"
                >
                  {dashTestStatus?.loading ? 'Pinging...' : 'Test Connection'}
                </button>
              </div>
              {dashTestStatus && (
                <div
                  className={`p-2 rounded text-[11px] flex items-center gap-1.5 ${
                    dashTestStatus.ok
                      ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950/50 text-rose-300 border border-rose-800'
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
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-200">Auto-Sync Submissions</p>
                <p className="text-[10px] text-slate-400">Automatically push evaluated code to dashboard</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
              {saveStatus && (
                <p className="text-[11px] text-emerald-400 text-center mt-2 font-medium">
                  {saveStatus}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                <History className="w-8 h-8 mx-auto text-slate-600" />
                <p>No evaluations recorded yet.</p>
                <p className="text-[10px]">Open LeetCode, write code, and click "Analyze Code" to see entries here.</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                      {item.problem_title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.overall_score >= 80
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.overall_score >= 60
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {item.overall_score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
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
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition flex items-center justify-center gap-1.5 text-center"
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
      <div className="p-2.5 border-t border-slate-800 text-center text-[10px] text-slate-500 bg-slate-950/40">
        Ready for LeetCode evaluation
      </div>
    </div>
  );
};
