import { Router } from 'express';
import { DeviceStore, LogStore } from '../store/index.js';
import { createDeviceRoutes } from './devices.js';

export function createRoutes(deviceStore: DeviceStore, logStore: LogStore): Router {
  const router = Router();
  const deviceRoutes = createDeviceRoutes(deviceStore, logStore);

  // 具体路由要在参数化路由之前定义
  router.get('/api/devices', deviceRoutes.listDevices);

  // 设备详情路由
  router.get('/api/devices/:deviceId', deviceRoutes.getDevice);

  // 日志路由 - DELETE 在 GET 之前，避免被拦截
  router.delete('/api/devices/:deviceId/logs', deviceRoutes.deleteLogs);
  router.get('/api/devices/:deviceId/logs', deviceRoutes.getLogs);

  return router;
}
