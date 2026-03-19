import type { Device, ConsoleLog } from '../types/index.js';

const API_BASE = 'http://localhost:3000/api';

export const api = {
  async listDevices(projectId?: string): Promise<Device[]> {
    const url = projectId ? `${API_BASE}/devices?projectId=${projectId}` : `${API_BASE}/devices`;
    const res = await fetch(url);
    return res.json();
  },

  async getLogs(deviceId: string, limit?: number, level?: string): Promise<ConsoleLog[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (level) params.append('level', level);

    const res = await fetch(`${API_BASE}/devices/${deviceId}/logs?${params}`);
    return res.json();
  },

  async getDevice(deviceId: string): Promise<Device> {
    const res = await fetch(`${API_BASE}/devices/${deviceId}`);
    return res.json();
  }
};
