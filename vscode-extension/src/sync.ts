import { SyncSubmissionPayload } from './types';

export async function syncSubmissionToDashboard(
  payload: SyncSubmissionPayload,
  dashboardUrl: string,
  token?: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!dashboardUrl || !dashboardUrl.trim()) {
    return { success: false, message: 'Dashboard URL is not configured.' };
  }

  const endpoint = `${dashboardUrl.replace(/\/$/, '')}/api/submissions`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {})
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson: any = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errJson.error || `Dashboard returned HTTP ${res.status}: ${res.statusText}`
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: 'Successfully synced submission to AlgoPulse dashboard!',
      data
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to dashboard at ${endpoint}: ${err.message || 'Network error'}`
    };
  }
}
