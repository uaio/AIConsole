import { Router } from 'express';
import { DeviceStore, LogStore, NetworkStore, StorageStore } from '../store/index.js';
import { createDeviceRoutes } from './devices.js';

export function createRoutes(deviceStore: DeviceStore, logStore: LogStore, networkStore: NetworkStore, storageStore: StorageStore): Router {
  const router = Router();
  const deviceRoutes = createDeviceRoutes(deviceStore, logStore, networkStore, storageStore);

  // 具体路由要在参数化路由之前定义
  router.get('/api/devices', deviceRoutes.listDevices);

  // 设备详情路由
  router.get('/api/devices/:deviceId', deviceRoutes.getDevice);

  // 日志路由 - DELETE 在 GET 之前，避免被拦截
  router.delete('/api/devices/:deviceId/logs', deviceRoutes.deleteLogs);
  router.get('/api/devices/:deviceId/logs', deviceRoutes.getLogs);

  // 网络请求路由
  router.get('/api/devices/:deviceId/network', deviceRoutes.getNetworkRequests);

  // 存储路由
  router.get('/api/devices/:deviceId/storage', deviceRoutes.getStorage);

  return router;
}
