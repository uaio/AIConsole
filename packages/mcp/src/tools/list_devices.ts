import type { Device } from '@aiconsole/server';

export const listDevices = {
  name: 'list_devices',
  description: '列出所有当前连接的设备',
  inputSchema: {
    type: 'object' as const,
    properties: {
      projectId: {
        type: 'string' as const,
        description: '项目 ID，用于过滤设备'
      }
    }
  },

  async execute(args: { projectId?: string }): Promise<Device[]> {
    try {
      const url = args.projectId
        ? `http://localhost:3000/api/devices?projectId=${args.projectId}`
        : `http://localhost:3000/api/devices`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      return [];
    }
  }
};
